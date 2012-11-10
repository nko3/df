var $ = require('jquery-browserify')
//var Game = require('./game')

var shoe = require('shoe')
var reconnect = require('reconnect')
var MuxDemux = require('mux-demux')

var Game = require('../data/game')
var rooms = require('../data/rooms')

var mx


var DEBUG_ROOM = true

$(function() {
  reconnect(function (stream) {
    stream.pipe(mx = MuxDemux()).pipe(stream)
    if (DEBUG_ROOM) {
      $('#cont').empty()
      mx.createStream('main').pipe(rooms)
    }
    else
    mx.createStream({room: 'foo'}).pipe(game)
    
  }).connect('/shoe')

});

rooms.on('add:room', function(r) {
  var $room = require('../views/room.jade')
  var el = $($room(r))
  el.id = 'room-' + r.id
  $('#cont').append(el)
})

rooms.on('del:room', function(id) {
  $('#room-' + id).remove()
})

rooms.on('set:watchers', function(count) {
  $('#room-' + id).find('.watchers').text(count)
})

rooms.on('set:joined', function(count) {
  $('#room-' + id).find('.players > .joined').text(count)
})

global.addRoom = function (data) {
  $.ajax({
    type: 'POST',
    url: '/new',
    dataType: 'json',
    data: data
  }).done(function(data) {
    console.log('Posted', data);
  }).fail(function(e) {
    throw(e)
  })
}

if (!DEBUG_ROOM) {

var game = new Game()

$game = require('../views/game.jade')
var el = $($game({}))

$player = require('../views/player.jade')

game.on('init', function(data) {
  //data -> {name, limit}
  el.find('.name').text(data.name)
  el.find('.players > .limit').text(data.limit)
  el.find('.board').empty()
})
game.on('set:state', function(state) {
  //state -> (pending, active, end)
})
game.on('set:watchers', function(count) {
  el.find('.watchers .value').text(count)
})

game.on('add:player', function(player) {
  // player -> {id, name, avatar}
  el.find('.players > .joined').text(game.active.length)
  el.find('.board').append($player({player: player}))
})
game.on('del:player', function(playerId) {
  el.find('.players > .joined').text(game.active.length)
  el.find('.board #player'+playerId).remove()
})

game.on('set:master', function(playerId) {
  // master player has right to start the game.
})
game.on('set:starttime', function(time) {
  //in seconds
})
game.on('start', function(board) {
  // board -> Array(81)
})
game.on('turn', function(playerId) {
  // move pointer arrow. if playerId == current then show buttons.
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
