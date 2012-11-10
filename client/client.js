var $ = require('jquery-browserify')
//var Game = require('./game')

var shoe = require('shoe')
var reconnect = require('reconnect')
var MuxDemux = require('mux-demux')

var Game = require('../data/game')


var mx


var DEBUG_ROOM = true

$(function() {
  reconnect(function (stream) {
    stream.pipe(mx = MuxDemux()).pipe(stream)
    if (DEBUG_ROOM) {
        router.init()
    }
    else
    mx.createStream({room: 'foo'}).pipe(game)
    
  }).connect('/shoe')

});

var router = require('./router')



router.addRoute('/game.html', function() {
  console.log('open main');
  return require('./rooms').init(mx)
})

router.addRoute('/p/:room', function(d) {
  console.log('open room', d.room)
  return {}
})



if (!DEBUG_ROOM) {

var game = new Game()

$game = require('../views/game.jade')
var el = $($game({}))

$player = require('../views/player.jade')

game.on('init', function(data) {
  //data -> {name, limit}
  el.find('.name').text(data.name)
  el.find('.players-limit').text(data.limit)
  el.find('.board').empty()
})
game.on('set:state', function(state) {
  //state -> (pending, active, end)
  $('#cont').attr('class', 'state-'+state)
  if (state == 'end')
    el.find('.board div').removeClass('current')
})
game.on('set:watchers', function(count) {
  el.find('.watchers').text(count)
})

game.on('add:player', function(player) {
  // player -> {id, name, avatar}
  el.find('.players-joined').text(game.active.length)
  el.find('.board').append($player({player: player}))
})
game.on('del:player', function(playerId) {
  el.find('.players-joined').text(game.active.length)
  el.find('#player'+playerId).remove()
})

game.on('set:master', function(playerId) {
  // master player has right to start the game.
})
game.on('set:starttime', function(time) {
  //in seconds
  $('#cont').addClass('starttime')
  $('.timer').text(time);
  game.timerInterval = setInterval(function(){$('.timer').text(parseInt($('.timer').text()) - 1)}, 1000)
})
game.on('start', function(board) {
  // board -> Array(81)
  $('#cont').removeClass('starttime')
  clearInterval(game.timerInterval)
})
game.on('turn', function(playerId) {
  // move pointer arrow. if playerId == current then show buttons.
  el.find('.player').removeClass('current')
  el.find('#player'+playerId).addClass('current')
})

game.on('result:cpu', function(result) {
  // result -> {playerId, time, ping}
})
game.on('result:net', function(result) {
  // result -> {playerId, packets}
})


$(function(){
  $('#cont').html(el)
  console.log('loaded')
})

global.test = function(num) {
  var tests = {1: require('./test1')}
  var g = new Game()
  g.replicateStream().pipe(mx.createStream({push: 'foo'}))
  g.emit('clear')
  tests[num](g)
}

}
