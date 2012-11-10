var Data = require('data')
var inherits = require('util').inherits

function Game() {
  this.name = ''
  this.limit = 10
  this.state = 'pending'
  this.players = {}
  this.active = []
  this.master = null
  this.starttime = -1
  this.board = null
  this.turn = null
  this.cpuresults = []
  this.netresults = []
  
  this.on('clear', function() {
    
  })
  this.on('replicate', function() {
    
  })

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
  
}
inherits(Game, Data)

module.exports = Game