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
  game.resultCpu = {}

  $game = require('../views/game.jade')
  var el = $($game({}))

  $player = require('../views/player.jade')
  $rowcpu = require('../views/rowcpu.jade')

  game.on('init', function(data) {
    //data -> {name, limit}
    game.resultCpu = {}
    el.find('.name').text(data.name)
    el.find('.players-limit').text(data.limit)
    el.find('.board').empty()
    el.find('.result-cpu table tbody').empty()
  })
  game.on('set:state', function(state) {
    //state -> (pending, active, end)
    $('#cont').attr('class', 'state-'+state)
    if (state == 'end')
      el.find('.player').removeClass('current')
  })
  game.on('set:watchers', function(count) {
    el.find('.watchers').text(count)
  })

  game.on('add:player', function(player, notactive) {
    // player -> {id, name, avatar}
    if (notactive) return;
    el.find('.players-joined').text(game.active.length)
    el.find('.board').append($player({player: player}))
    game.renderPlayers()
  })
  game.on('del:player', function(playerId) {
    el.find('.players-joined').text(game.active.length)
    el.find('#player'+playerId).remove()
    game.renderPlayers()
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
    var id = result.playerId
    if (typeof game.resultCpu[id] == 'undefined') {
      game.resultCpu[id] = {
        sum: result.time,
        cnt: 1,
        avg: result.time,
      }
      el.find('.result-cpu table tbody').append($($rowcpu({id: id, name: game.players[id].name, data: game.resultCpu[id]})))

    } else {
      game.resultCpu[id].sum += result.time
      game.resultCpu[id].cnt += 1
      game.resultCpu[id].avg = Math.round(game.resultCpu[id].sum / game.resultCpu[id].cnt)
      el.find('#rowcpu-sum-'+id).text(game.resultCpu[id].sum)
      el.find('#rowcpu-cnt-'+id).text(game.resultCpu[id].cnt)
      el.find('#rowcpu-avg-'+id).text(game.resultCpu[id].avg)
    }
  })

  game.on('result:net', function(result) {
    // result -> {playerId, packets}
  })

  game.renderPlayers = function() {
    var r = parseInt(el.find('.board').css('width')) / 2;
    var l = game.active.length
    var step = Math.PI * 2 / l
    for (var i = 0; i < l; i++) {
      el.find('#player'+game.active[i])
        .css('left', r + Math.round(r * Math.cos(i*step)))
        .css('top', r + Math.round(r * Math.sin(i*step)))
    }
  }

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

