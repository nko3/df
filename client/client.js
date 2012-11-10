var $ = require('jquery-browserify')
var Game = require('./game')

var game = new Game()

game.on('init', function(data) {
  //data -> {name, limit}
})
game.on('set:state', function(state) {
  //state -> (pending, active, end)
})
game.on('set:watchers', function(count) {
})

game.on('add:player', function(player) {
  // player -> {id, name, avatar}
})
game.on('del:player', function(playerId) {
  
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

$game = require('../views/game.jade')

$(function(){
  $('#cont').html($game({name: 'foo'}))
  console.log('loaded')
})
