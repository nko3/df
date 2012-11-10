var Data = require('data')
var inherits = require('util').inherits

function Game() {
  Data.call(this)
  
  var self = this
  this.on('clear', function() {
    self.name = ''
    self.limit = 10
    self.watchers = 0
    self.state = 'pending'
    self.players = {}
    self.active = []
    self.master = null
    self.starttime = -1
    self.board = null
    self.turn = null
    self.cpuresults = []
    self.netresults = []
  })
  this.on('replicate', function() {
    
  })

  game.on('init', function(data) {
    self.name = data.name
    self.limit = data.limit
    if (data.watchers) {
      self._emit('set:watchers', data.watchers)
    }
  })
  game.on('set:state', function(state) {
    self.state = state
  })
  game.on('set:watchers', function(count) {
    self.watchers = count
  })

  game.on('add:player', function(player) {
    self.players[player.id] = player
    self.active.push(player.id)
  })
  game.on('del:player', function(playerId) {
    var ix = self.active.indexOf(id)
    if (ix != -1) {
      self.active.splice(ix, 1)
    }
  })

  game.on('set:master', function(playerId) {
    self.master = playerId
  })
  game.on('set:starttime', function(time) {
    self.starttime = time
  })
  game.on('start', function(board) {
    self.board = board
  })
  game.on('turn', function(playerId) {
    self.turn = playerId
  })

  game.on('result:cpu', function(result) {
    self.cpuresults.push(result)
  })
  game.on('result:net', function(result) {
    self.netresults.push(result)
  })
  
}
inherits(Game, Data)

module.exports = Game