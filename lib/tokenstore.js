exports.TokenStore = function(){
  var tokens = {}
  
  this.store = function(sessionId, token){
    tokens[sessionId] = token
  }  
  
  this.getBySessionId = function(sessionId){
    return tokens[sessionId]
  }
}
