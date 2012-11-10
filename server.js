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

var Game = new require('./data/game')

var rooms = {
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
    if (s.meta.room) {
      if (rooms[s.meta.room]) {
        s.pipe(rooms[s.meta.room])
        rooms[s.meta.room].replicateStream().pipe(s)
      }
      else {
        s.end()
      }
    }
  })
  mx.pipe(sock).pipe(mx)
}).install(server, '/shoe')