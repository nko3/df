var express = require('express')
var shoe = require('shoe')
var MuxDemux = require('mux-demux')
var through = require('through')

var conf = global.conf = require('rc')(require('./package').name, {
  port: 3300,
  room_delete_key: 'room_delete_key',
  redis: 'redis://localhost/nodoku'
})

var app = express()
app.use(express.bodyParser())
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/static'))

var browserify = require('browserify')({debug: true})
browserify.use(require('resourcify/jade'))
browserify.addEntry(__dirname + '/client/client.js')
app.use(browserify)

var server = app.listen(conf.port)
console.log('Server started at http://localhost:' + conf.port)


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/static/game.html')
})
app.get('/p/:room', function(req, res) {
  res.sendfile(__dirname + '/static/game.html')
})

var room = require('./room')
app.post('/new', room.new)

app.get('/' + conf.room_delete_key + '/:room', function(req, res) {
  room.rooms.emit('del:room', req.params.room)
  res.end('ok')
})

shoe(function (sock) {
  var mx = new MuxDemux
  mx.on('connection', function(s) {
    if (s.meta == 'main') {
      s.pipe(room.rooms.replicateStream()).pipe(s)
    }
    else if (s.meta.room) {
      var r = room.getInstance(s.meta.room)
      if (r) s.pipe(r.getStream()).pipe(s)
      else s.end()
    }
    else if (s.meta.push) {
      r = room.getInstance(s.meta.push)
      if (r) s.pipe(r.game)
      else s.end()
    }
  })
  mx.pipe(sock).pipe(mx)
}).install(server, '/shoe')