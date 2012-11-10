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
}

Room.prototype.getStream = function() {
  var game = this.game
  var s = game.replicateStream()
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


