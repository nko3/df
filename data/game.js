var Data = require('../lib/data')
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
  this.on('replicate', function(copy) {
    copy.emit('init', {
      name: self.name,
      limit: self.limit,
      watchers: self.watchers
    })
    self.active.forEach(function(id) {
      copy.emit('add:player', id)
    })
    for (var id in self.players) {
      if (-1 == self.active.indexOf(id)) {
        copy.emit('add:player', self.players[id], true)
      }
    }
    if (self.master) {
      copy.emit('set:master', self.master)
    }
    if (self.turn) {
      copy.emit('set:turn', self.turn)
    }
    if (self.starttime != -1) {
      var diff = self.starttime - (new Date() - self.starttimestamp) / 1000
      if (diff > 0) {
        copy.emit('set:starttime', diff)
      }
    }
    self.cpuresults.forEach(function(c) {
      copy.emit('result:cpu', c)
    })
    self.netresults.forEach(function(n) {
      copy.emit('result:net', n)
    })
  })

  this.on('init', function(data) {
    self.name = data.name
    self.limit = data.limit
    if (data.watchers) {
      self._emit('set:watchers', data.watchers)
    }
  })
  this.on('set:state', function(state) {
    self.state = state
  })
  this.on('set:watchers', function(count) {
    self.watchers = count
  })

  this.on('add:player', function(player, notactive) {
    self.players[player.id] = player
    if (!notactive) {
      self.active.push(player.id)
    }
  })
  this.on('del:player', function(playerId) {
    var ix = self.active.indexOf(playerId)
    if (ix != -1) {
      self.active.splice(ix, 1)
    }
  })

  this.on('set:master', function(playerId) {
    self.master = playerId
  })
  this.on('set:starttime', function(time) {
    self.starttime = time
    self.starttimestamp = new Date
  })
  this.on('start', function(board) {
    self.board = board
  })
  this.on('turn', function(playerId) {
    self.turn = playerId
  })

  this.on('result:cpu', function(result) {
    self.cpuresults.push(result)
  })
  this.on('result:net', function(result) {
    self.netresults.push(result)
  })
  
  this.emit('clear')
  
}
inherits(Game, Data)

module.exports = Game