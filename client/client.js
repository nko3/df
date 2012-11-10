var $ = require('jquery-browserify')
var Game = require('./game')

var game = new Game()

$game = require('../views/game.jade')
var el = $($game({}))

game.on('init', function(data) {
  //data -> {name, limit}
  el.find('.name').text(data.name)
  el.find('.players > .limit').text(data.limit)
})
game.on('set:state', function(state) {
  //state -> (pending, active, end)
})
game.on('set:watchers', function(count) {
  el.find('.watchers').text(count)
})

game.on('add:player', function(player) {
  // player -> {id, name, avatar}
  el.find('.players > .joined').text(game.active.length)
})
game.on('del:player', function(playerId) {
  el.find('.players > .joined').text(game.active.length)
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
  tests[num](game)
}
