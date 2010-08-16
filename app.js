var connect = require('connect'),
    express = require('express'),
    payflow = require('paynode').use('payflowpro'),
    TokenStore = require('./lib/tokenstore').TokenStore,
    Products = require('./lib/orders').Products,
    Orders = require('./lib/orders').Orders,
    mapper = require('./lib/requestBuilder')

var app = express.createServer(
    connect.logger(),
    connect.bodyDecoder(),
    connect.methodOverride(),
    connect.cookieDecoder(),
    connect.session()
    )
    
app.set('reload views', 1000)



var client = payflow.createClient({level:payflow.levels.sandbox
    , user:'webpro_1279778538_biz_api1.gmail.com'
    , password:'1279778545'
    , signature: 'AiPC9BjkCyDFQXbSkoZcgqH3hpacA0hAtGdCbvZOkLhMJ8t2a.QoecEJ'
})

var products = new Products()
var orders = new Orders()
var tokenStore = new TokenStore()
var customers = {}

app.get('/start', function(req, res){
  products.fetch({maxresults:5}, function(err, result){
    res.render('start.haml', {locals:{products:result}})
  })
})

app.post('/start', function(req, res){
  products.fetchProductsByNames(req.param('product'), function(err, products){
    // create and save the order
    orders.save(req.sessionHash, products)
    // build request
    var request = mapper.buildRequest(products)
    request.returnurl = 'http://localhost:3000/confirm'
    request.cancelurl = 'http://localhost:3000/cancel'

    // make request and handle response
    client.setExpressCheckout(request).on('success', function(response){
      tokenStore.store(req.sessionHash, response.token)
      res.redirect('https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token='+response.token)
    }).on('failure', function(response){
      res.render('start.haml', {locals:{
        error:response.errors[0].longmessage
        }
      })
    })
  })
})
app.get('/confirm', function(req, res){
  tokenStore.store(req.sessionHash, req.param('token'))
  customers[req.sessionHash] =req.param('PayerID')
  client.getExpressCheckoutDetails({token:req.param('token')})
    .on('success', function(response){
      orders.save(req.sessionHash, response)
      res.render('confirm.haml', {
        locals:{
          paypalResponse:response,
          orderTotal:response.paymentrequest[0].amt
        }
      })     
    })
    .on('failure', function(response){
      res.render('error.haml', {locals:{error:response.errors[0].longmessage}})
    })
})

app.get('/cancel', function(req, res){
  res.render('cancel.haml')
})

app.post('/final', function(req, res){
   var id = req.sessionHash
   orders.get(id, function(order){
     var paymentrequest = []
     order.paymentrequest.forEach(function(order){
       paymentrequest.push({amt:order.amt, paymentaction:'Sale'})
     })
     var request = {token:tokenStore.getBySessionId(id)
      ,payerid:customers[id]
      ,paymentrequest:paymentrequest
      }
     
     client.doExpressCheckoutPayment(request)
        .on('success', function(response){
          res.render('final.haml')
        })
        .on('failure', function(response){
          s.puts(s.inspect(response))
          res.render('error.haml', {locals:{error:response.errors[0]}})
        })
   })
      
})

app.listen(3000)
console.log('App started listening on port 3000. Navigate to http://localhost:3000/start')
