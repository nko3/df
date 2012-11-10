var express = require('express')

var conf = global.conf = require('rc')(require('./package').name, {
  port: 3300
})


var app = express()
app.use(express.bodyParser())
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.listen(conf.port)
console.log('Server started at http://localhost:' + conf.port)

app.use(express.static(__dirname + '/static'))

app.get('/', function(req, res) {
  res.render('fp')
})

