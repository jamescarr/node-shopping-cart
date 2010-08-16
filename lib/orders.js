var someProducts = [
  {name:'Kindle', desc: 'Ebook Reader', price:200.00},
  {name:'kindle cover', desc:'Cover for kindle', price:20.00},    
  {name:'Infinite Crisis', desc:'comic book', price:15.00},
  {name:'Stranger in a Strange Land', author:'Robert A. Heinlein', desc:'winner of the 1962 Hugo Award', price:11.34},
  {name:'The Moon Is a Harsh Mistress', author:'Robert A. Heinlein', price:10.87},
  {name:'Dune', author:'Frank Herbert',   price:12.28}
  
]

function InMemoryProducts(){
  this.fetch = function(options, callback){
    callback(null, someProducts.slice(0, options.maxresults))
  }
  this.fetchProductsByNames = function(names, callback){
    var productsSelected = someProducts.filter(
        function(product){ 
          return names.indexOf(product.name) > -1 
        })
    callback(null, productsSelected)
  }
}

function InMemoryOrders(){
  var unprocessedOrders = {}
  this.save = function(session, order){
    unprocessedOrders[session] = order
  }
  this.get = function(session, cb){
    cb(unprocessedOrders[session])
  }
}


exports.Products = InMemoryProducts
exports.Orders = InMemoryOrders


