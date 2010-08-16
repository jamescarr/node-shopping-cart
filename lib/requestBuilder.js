var sys = require('sys')


exports.buildRequest = function(products){
  var items = products.map(function(product){
    return {name:product.name, desc:product.desc||product.author, amt:product.price}
  })
  
  return {
    amt:items.reduce(sumItemPrice, 0),
    items:items
  }
}

var sumItemPrice = function(total, item){
  return item.amt + total
}
