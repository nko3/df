var $ = require('jquery-browserify')
//var Game = require('./game')

var shoe = require('shoe')
var reconnect = require('reconnect')
var MuxDemux = require('mux-demux')

var mx
$(function() {
  reconnect(function (stream) {
   
    stream.pipe(mx = MuxDemux()).pipe(stream)
    router.init()
  }).connect('/shoe')

});

var router = require('./router')


router.addRoute('/game.html', function() {
  console.log('open main');
  return require('./rooms').init(mx)
})

router.addRoute('/p/:room', function(d) {
  console.log('open room', d.room)
  return require('./game').init(mx, d.room)
})


$(function(){
  $(document.body).append(require('../views/footer.jade')())
  
  $('.button-rooms .btn').on('click', function() {
    router.navigate('/game.html')
  })
  
  $('.button-help .btn').on('click', function() {
    require('./instructions').open()
  })
  
})