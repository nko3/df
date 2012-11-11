var dialog = require('./dialog')

var el
var d
exports.open = function() {
  
  el = $('<div class="instructions-cont"></div>')
  d = dialog(el)
  page1()
  
  
  window.localStorage.setItem('instuctions_open', true)
  
}

function page1() {
  var tpl = require('../views/instructions1.jade')
  
  el.html(tpl())
  
  el.find('.btn.skip').on('click', function() {
    d.remove()
  })
  
  el.find('.btn.next').on('click', function() {
    page2()
  })
  
  
}

function page2() {
  var tpl = require('../views/instructions2.jade')
  
  el.html(tpl())
  
  el.find('.btn.skip').on('click', function() {
    d.remove()
  })
  
  el.find('.btn.next').on('click', function() {
    page3()
  })
  

}
function page3() {
  var tpl = require('../views/instructions3.jade')
  
  el.html(tpl())
  
  el.find('.btn.skip').on('click', function() {
    d.remove()
  })
  

}