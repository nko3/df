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

var rooms = require('./data/rooms')
var kv = require('kv')('/tmp/kv')
kv.has('rooms', function(err, stat){
  if (!err && stat) {
    kv.get('rooms').pipe(rooms)
  }
  rooms.replicateStream().pipe(kv.put('rooms'))
})

function uniqueId() {
  return Math.floor(Math.random() * 1e8).toString(16)
}

app.post('/new', function(req, res) {
  req.body.id = uniqueId()
  rooms.emit('add:room', req.body)
  res.json(req.body)
})


var Game = new require('./data/game')

var _rooms = {
  foo: new Game()
}
/*
setInterval(function() {
  rooms.foo.emit('set:watchers', Math.floor(Math.random()*10))
}, 1000)
*/
shoe(function (sock) {
  var mx = new MuxDemux
  mx.on('connection', function(s) {
    if (s.meta == 'main') {
      s.pipe(rooms.replicateStream()).pipe(s)
    }
    else if (s.meta.room) {
      if (_rooms[s.meta.room]) {
        s.pipe(_rooms[s.meta.room].replicateStream()).pipe(s)
      }
      else {
        s.end()
      }
    }
    else if (s.meta.push) {
      s.pipe(_rooms[s.meta.push])
    }
  })
  mx.pipe(sock).pipe(mx)
}).install(server, '/shoe')