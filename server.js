var express = require('express')
var shoe = require('shoe')
var MuxDemux = require('mux-demux')
var through = require('through')

var conf = global.conf = require('rc')(require('./package').name, {
  port: 3300
})

var app = express()
app.use(express.bodyParser())
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/static'))

var browserify = require('browserify')({watch:true, debug: true})
browserify.use(require('resourcify/jade'))
browserify.addEntry(__dirname + '/client/client.js')
app.use(browserify)

var server = app.listen(conf.port)
console.log('Server started at http://localhost:' + conf.port)

app.get('/', function(req, res) {
  res.render('fp')
})
app.get('/p/:room', function(req, res) {
  res.sendfile(__dirname + '/static/game.html')
})

var room = require('./room')
app.post('/new', room.new)


var Game = new require('./data/game')

var _rooms = {
}

shoe(function (sock) {
  var mx = new MuxDemux
  mx.on('connection', function(s) {
    if (s.meta == 'main') {
      s.pipe(room.rooms.replicateStream()).pipe(s)
    }
    else if (s.meta.room) {
      if (!_rooms[s.meta.room]) {
        var r = room.rooms.getRoom(s.meta.room)
        if (r) {
          _rooms[s.meta.room] = new Game()
          _rooms[s.meta.room].emit('init', r)
          s.pipe(_rooms[s.meta.room].replicateStream()).pipe(s)
        }
        else {
          s.end();
        }
        
      }
      else {
        s.pipe(_rooms[s.meta.room].replicateStream()).pipe(s)
      }
    }
    else if (s.meta.push) {
      s.pipe(_rooms[s.meta.push])
    }
  })
  mx.pipe(sock).pipe(mx)
}).install(server, '/shoe')