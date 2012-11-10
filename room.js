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
  
  this.game.on('set:watchers', function(count) {
    rooms.emit('set:watchers', data.id, count)
  })
  
  this.game.emit('set:watchers', 0)
}

Room.prototype.getStream = function() {
  var self = this
  var game = this.game
  var s = new MuxDemux(function(s){
    if (s.meta == 'data') {
      s.pipe(game.replicateStream()).pipe(s)
    }
    else if (s.meta == 'dnode') {
      var d = dnode({
        transform: function(s, cb) {
          cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
        }
      })
      s.pipe(d).pipe(s)
    }
  })
  
  s.on('end', function() {
    var ix = self.watchers.indexOf(s)
    self.watchers.splice(ix, 1)
    game.emit('set:watchers', self.watchers.length)
  })
  this.watchers.push(s)
  game.emit('set:watchers', this.watchers.length)
  return s
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


