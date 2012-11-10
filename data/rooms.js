var Data = require('../lib/data')
var inherits = require('util').inherits

function Rooms() {
  Data.call(this)

  var self = this
  this.on('clear', function() {
    self.rooms = []
  })
  this.on('add:room', function (room) {
    room.name = room.name || 'Untitled'
    room.watchers = room.watchers || 0
    room.limit = room.limit || 10
    room.joined = room.joined || 0
    self.rooms.push(room)
  })
  this.on('del:room', function (id) {
    self.rooms = self.rooms.filter(function(r){
      return r.id != id
    })
  })
  this.on('set:watchers', function (id, count) {
    self.getRoom(id).watchers = count
  })
  this.on('set:joined', function (id, count) {
    self.getRoom(id).joined = count
  })

  this.on('replicate', function(copy) {
    self.rooms.forEach(function(r) {
      copy.emit('add:room', r)
    })
  })
  this.emit('clear')

}
inherits(Rooms, Data)

Rooms.prototype.getRoom = function(id) {
  return this.rooms.filter(function(r) {
    return r.id == id
  })[0]
}


module.exports = new Rooms