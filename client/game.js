/*var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function Game() {
  var self = this
  this.players = {}
  this.active = []
  this.on('add:player', function(player) {
    self.players[player.id] = player
    self.active.push(player.id)
  })
  this.on('del:player', function(playerId) {
    var ix = self.active.indexOf(playerId)
    self.active.splice(ix, 1)
  })
}
inherits(Game, EventEmitter)

Game.prototype.join = function(playerdata, cb) {
  // playerdata -> {name, avatar}
  // cb -> f(err, playerId)
}

Game.prototype.sendSolution = function(solution, solveTime, cb) {
  // solution -> {index1: val1, index2: val2}
  // solveTime - in milliseconds
  // cb -> f(err)
}

Game.prototype.setStartTime = function(time, cb) {
  // time - in seconds
  // cb -> f(err)
}

/* //(optional)
Game.prototype.increaseTimeout = function(timeout, cb) {
  // timeout - in seconds
  // cb -> f(err)
}
*/

//module.exports = Game

var Game = require('../data/game')


exports.init = function(mx, room) {
  global.room = room;
  global.mx = mx

  var game = new Game()

  $game = require('../views/game.jade')
  var el = $($game({}))

  $player = require('../views/player.jade')

  game.on('init', function(data) {
    //data -> {name, limit}
    el.find('.name').text(data.name)
    el.find('.players-limit').text(data.limit)
    el.find('.board').empty()
  })
  game.on('set:state', function(state) {
    //state -> (pending, active, end)
    $('#cont').attr('class', 'state-'+state)
    if (state == 'end')
      el.find('.board div').removeClass('current')
  })
  game.on('set:watchers', function(count) {
    el.find('.watchers').text(count)
  })

  game.on('add:player', function(player) {
    // player -> {id, name, avatar}
    el.find('.players-joined').text(game.active.length)
    el.find('.board').append($player({player: player}))
  })
  game.on('del:player', function(playerId) {
    el.find('.players-joined').text(game.active.length)
    el.find('#player'+playerId).remove()
  })

  game.on('set:master', function(playerId) {
    // master player has right to start the game.
  })
  game.on('set:starttime', function(time) {
    //in seconds
    $('#cont').addClass('starttime')
    $('.timer').text(time);
    game.timerInterval = setInterval(function(){$('.timer').text(parseInt($('.timer').text()) - 1)}, 1000)
  })
  game.on('start', function(board) {
    // board -> Array(81)
    $('#cont').removeClass('starttime')
    clearInterval(game.timerInterval)
  })
  game.on('turn', function(playerId) {
    // move pointer arrow. if playerId == current then show buttons.
    el.find('.player').removeClass('current')
    el.find('#player'+playerId).addClass('current')
  })

  game.on('result:cpu', function(result) {
    // result -> {playerId, time, ping}
  })
  game.on('result:net', function(result) {
    // result -> {playerId, packets}
  })

  $('#cont').html(el)  
  
  var s = mx.createStream({room: room})
  s.pipe(game)
  return {
    dispose: function() {
      s.end();
    }
  }
}




global.test = function(num) {
  var tests = {1: require('./test1')}
  var g = new Game()
  g.replicateStream().pipe(global.mx.createStream({push: global.room}))
  g.emit('clear')
  tests[num](g)
}

