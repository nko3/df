var rooms = require('./data/rooms')
var kv = require('kv')('/tmp/kv')
kv.has('rooms', function(err, stat){
  if (!err && stat) {
    kv.get('rooms').pipe(rooms)
  }
  rooms.replicateStream().pipe(kv.put('rooms'))
})


exports.rooms = rooms

exports.new = function(req, res) {
  req.body.id = uniqueId()
  rooms.emit('add:room', req.body)
  res.json(req.body)
}

function uniqueId() {
  return Math.floor(Math.random() * 1e8).toString(16)
}


