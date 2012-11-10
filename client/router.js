var Router = require('routes').Router

var router = new Router()

window.onpopstate = function(e) {
  if (e.state) {
    activate(e.state, true)
  }
}

exports.addRoute = function() {
  return router.addRoute.apply(router, arguments)
}

exports.init = function() {
  var currentUrl = window.location.pathname
  exports.navigate(currentUrl)
}

exports.navigate = function(url) {
  var replace = true
  if (window.history.state) {
    replace = false
  }
  
  var state = {}
  state.url = url
  activate(state, replace)
}


var last = null;
function activate(state, replace) {
  if (last && last.dispose) {
    last.dispose();
  }
  
  var match = router.match(state.url)
  if (!match) {
    throw('can\'t match ' + url)
  }
  
  var last = match.fn(match.params)

  if (replace)
    window.history.replaceState(state, state.title || "", state.url)
  else
    window.history.pushState(state, state.title || "", state.url)
}
