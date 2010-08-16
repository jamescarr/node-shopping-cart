var connect = require('connect'),
    express = require('express'),
    fs = require('fs'),
    cards = require('./lib/cards').cards
    payflow = require('paynode').use('payflowpro')

var sys = require('sys')
    
var app = express.createServer(
    connect.logger(),
    connect.bodyDecoder(),
    connect.methodOverride(),
    connect.cookieDecoder(),
    connect.session()
    )
    
function bootup(client){
  app.post('/', function(req, res){
    var request = {ipaddress:req.remoteAddress
    ,countrycode:'US'
    ,amt:50.00
    }
    ;['firstname','lastname','email','street',
      'street2', 'city', 'state', 'zip',
      'creditcardtype', 'acct', 'expdate', 'cvv2'
    ].forEach(function(field){
      request[field] = req.param(field)
    })
    client.doDirectPayment(request)
    .on('success', function(response){
      res.render('directpay-success.haml', {
        locals:{
          response:response
        }
      })
    })
    .on('failure', function(response){
      res.render('directpay.haml',{
        locals:{
          cards:cards,
          errors:response.errors  
        }
      })
      res.send(JSON.stringify(response))
    })
  })

  app.listen(3000, function(){
    console.log('app started...')
  })
}


fs.readFile('certs/private-key.pem', 'ascii', function(err, key){
  fs.readFile('certs/public-key.pem', 'ascii', function(err, cert){
    var client = payflow.createClient({level:payflow.levels.sandbox
        , user:'cert_1279865159_biz_api1.gmail.com'
        , password:'LXLDUTRFGA39YR25'
        , cert:cert
        , key:key})
    bootup(client)
  })
})


app.get('/', function(req, res){
    res.render('directpay.haml', {locals:{cards:cards, errors:[]}})
})
app.get('/styles/:sheet', function(req, res){
  var stylesheet = req.params.sheet
  fs.readFile(__dirname+'/css/'+stylesheet, function(err, contents){
    res.send(contents, {'Content-Type':'text/css'})
  })
})

