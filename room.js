var MuxDemux = require('mux-demux')
var dnode = require('dnode')
var rooms = require('./data/rooms')
var Game = require('./data/game')

var kv = require('kv')('/tmp/kv')
kv.has('rooms', function(err, stat){
  if (!err && stat) {
    kv.get('rooms').pipe(rooms)
  }
  rooms.replicateStream().pipe(kv.put('rooms'))
})


function Room(data) {
  this.game = new Game()
  this.game.emit('init', data)
  
  this.watchers = []
  this.remotes = {}
  
  this.game.on('set:watchers', function(count) {
    rooms.emit('set:watchers', data.id, count)
  })
  
  var game = this.game
  this.game.on('set:state', function(state) {
    if (state == 'end') {
      setTimeout(function() {
        game.emit('set:state', 'pending')
      }, 5000)
    }
  })
  
  this.game.emit('set:watchers', 0)
}

Room.prototype.getStream = function() {
  var self = this
  var playerId, remote
  var game = this.game
  var s = new MuxDemux(function(s){
    if (s.meta == 'data') {
      s.pipe(game.replicateStream()).pipe(s)
    }
    else if (s.meta == 'dnode') {
      var d = dnode({
        transform: function(s, cb) {
          cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
        },
        join: function (player, cb) {
          if (!player.name  || !player.name.length) {
            return cb({msg:'name is required'})
          }
          if (game.limit <= game.players.length) {
            return cb({msg:'room is full'})
          }
          if (playerId) {
            return cb({msg: 'already joined'})
          }
          playerId = player.id = uniqueId()
          cb(null, player.id)
          if (remote) {
            self.remotes[playerId] = remote
          }
          game.emit('add:player', player)
          if (!game.master) {
            game.emit('set:master', player.id)
          }
        },
        setStartTime: function(time, cb) {
          if (game.state == 'pending' && playerId == game.master
            && game.active.length >= 2) {
            clearTimeout(self.startTimeout)
            cb(null)
            game.emit('set:starttime', time)
            self.startTimeout = setTimeout(function() {
              self.activate()
            }, time * 1000)
          }
          else {
            cb({msg:'can\'t set start time'})
          }
        },
        sendSolution: function(solution, solveTime, cb) {
          if (room.turn != playerId) {
            return cb({msg: 'timed out'})
          }
          for (var i in solution) {
            if (self.solution[i] == solution[i]) {
              self.board[i] = self.solution[i]
            }
          }
          self.boards[playerId] = [].concat(self.board)
          self.game.emit('result:cpu', {
            playerId: playerId,
            time: time,
            ping: (self.turnTime - new Date()) - time
          })
          cb(null)
          self.nextMove()
        },
        increaseTimeout: function(timeout, cb) {
        
        },
        getBoard: function(cb) { //todo: remove, just for testing
          self.getBoard(cb)
        } 
      })
      d.on('remote', function(r) {
        remote = r
        if (playerId) {
          self.remotes[playerId] = remote
        }
      })
      s.pipe(d).pipe(s)
    }
  })
  
  s.on('end', function() {
    var ix = self.watchers.indexOf(s)
    self.watchers.splice(ix, 1)
    
    if (playerId) { //only if active
      game.emit('del:player', playerId)
      if (game.master == playerId) {
        if (game.active.length) {
          var rand = Math.floor(game.active.length * Math.random())
          game.emit('set:master', game.active[rand])
        }
        else {
          game.emit('set:master', null)
        }
      }
      if (game.players.length < 1) {
        if (game.state == 'pending') {
          game.emit('set:starttime', -1)
          clearTimeout(self.startTimeout)
        }
        else if (game.state == 'active') {
          game.emit('set:state', 'end')
        }
      }
    }
    
    game.emit('set:watchers', self.watchers.length)
  })
  this.watchers.push(s)
  game.emit('set:watchers', this.watchers.length)
  return s
}

Room.prototype.activate = function () {
  console.log('activate')
  var game = this.game
  var self = this
  this.boards = {}
  this.getBoard(function(board, solution){
    self.board = self.startboard = board
    self.solution = solution
    game.emit('start', board)
    game.emit('set:state', 'active')
    self.nextMove()
  })
}

Room.prototype.getBoard = function(cb) {
  var fork = require('child_process').fork
  var sudoku = fork(__dirname + '/sudoku.js', [], {silent: true})
  var mx = new MuxDemux(function(s) {
    s.on('data', function(d) {
      cb(d.puzzle, d.solution)
    })
  })
  sudoku.stdout.pipe(mx)
}

Room.prototype.nextMove = function() {
  var index
  var game = this.game
  if (game.turn == -1) {
    index = game.active[Math.floor(game.active.length * Math.random())]
  }
  else {
    index = game.active.indexOf(game.turn)
    index++
    if (game.active.length <= index) index = 0
  }
  var playerId = game.active[index]
  var remote = this.remotes[remote]
  if (!this.boards[playerId]) {
    this.boards[playerId] = [].concat(this.startboard)
  }
  var diff = this.diff(this.board, this.boards[playerId])
  if (diff.length) {
    // todo: possible lock if connection lost in here
    remote.mixSolution(diff.items, function(err, num) {
      if (num) {
        game.set('result:net', {playerId: playerId, packets: num})
      }
      game.emit('set:turn', playerId)
      self.turnTime = new Date
    })
  }
  else {
    game.emit('set:turn', playerId)
    this.turnTime = new Date
  }

}

Room.prototype.diff = function(b1, b2) {
  var count = 0
  var items = {}
  b1.forEach(function(c, i) {
    if (c != null && b2[i] == null) {
      count++;
      items[i] = c
    }
  })
  return {count: count, items: items}
}

exports.Room = Room

var map = {}
exports.getInstance = function (id) {
  if (!map[id]) {
    var r = rooms.getRoom(id)
    if (!r) return null
    map[id] = new Room(r)
  }
  return map[id]
}

exports.rooms = rooms

exports.new = function(req, res) {
  req.body.id = uniqueId()
  rooms.emit('add:room', req.body)
  res.json(req.body)
}

function uniqueId() {
  return Math.floor(Math.random() * 1e8).toString(16)
}


