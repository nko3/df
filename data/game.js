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
    self.solved = false
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
      copy.emit('add:player', self.players[id])
    })
    for (var id in self.players) {
      if (-1 == self.active.indexOf(id)) {
        copy.emit('add:player', self.players[id], true)
      }
    }
    if (self.solved) {
      copy.emit('set:solved', self.solved)
    }
    copy.emit('set:state', self.state)
    if (self.starttime != -1) {
      var diff = self.starttime - (new Date() - self.starttimestamp) / 1000
      if (diff > 0) {
        copy.emit('set:starttime', diff)
      }
    }
    if (self.master) {
      copy.emit('set:master', self.master)
    }
    if (self.state != 'pending' && self.board) {
      copy.emit('start', self.board)
    } 
    
    if (self.turn) {
      copy.emit('turn', self.turn)
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
    if (state == 'pending') {
      self.solved = false
      self.board = null
      self.cpuresults = []
      self.netresults = []
      var p = {}
      for (var i in self.players) {
        if (-1 != self.active.indexOf(i)) {
          p[i] = self.players[i]
        }
      }
      self.players = p
    }
  })
  this.on('set:watchers', function(count) {
    self.watchers = count
  })

  this.on('add:player', function(player, notactive) {
    self.players[player.id] = player
    if (!notactive) {
      self.active.push(player.id.toString())
    }
  })
  this.on('del:player', function(playerId) {
    var ix = self.active.indexOf(playerId.toString())
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
  this.on('set:solved', function(bool) {
    self.solved = bool
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