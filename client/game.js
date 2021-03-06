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
var MuxDemux = require('mux-demux')
var dnode = require('dnode')
var Game = require('../data/game')
var Grid = require('./gridview').Grid


exports.init = function(mx, room) {
  //global.room = room;
  //global.mx = mx
  

  var game = new Game()
  var remote

  $game = require('../views/game.jade')
  var el = $($game({}))

  $player = require('../views/player.jade')
  $rowcpu = require('../views/rowcpu.jade')
  $rowleaderboard = require('../views/rowleaderboard.jade')
  
  game.on('update:btn-join', function() {
    el.find('.button-join').toggle(
      !game.myId && game.active.length < game.limit
    )
  })
  game.on('update:start-btn', function() {
    el.find('.button-start').toggle(
      game.state == 'pending' && game.master == game.myId &&
      !!game.master && game.active.length >= 2
    )
    el.find('.button-start-nopeople').toggle(
      !game.timerInterval &&
      game.state == 'pending' && game.active.length < 2
    )
    el.find('.button-start-notmaster').toggle(
      !game.timerInterval &&
      game.state == 'pending' && game.master != game.myId &&
      !!game.master && game.active.length >= 2
    )
  })
  game.on('update:player-data', function() {
    if (window.sessionStorage['myName']) {
      el.find('.info .player-data').text(window.sessionStorage['myName'])
      el.find('.info .player-data-wrap').show();
    } else {
      el.find('.info .player-data-wrap').hide();
    }
  })

  game.on('init', function(data) {
    //data -> {name, limit}
    game.initResult()
    el.find('.name').text(data.name)
    el.find('.players-limit').text(data.limit)
    el.find('.board').empty()
    el.find('.result-cpu table tbody').empty()
    el.find('.result-net-content .names').empty()
    el.find('.result-net-content .packets').empty()
    el.find('.result-leaderboard table tbody').empty()
    game.emit('update:btn-join')
    game.emit('update:start-btn')
    game.emit('update:player-data')
  })
  game.on('set:state', function(state) {
    //state -> (pending, active, end)
    console.log('state', state);
    $('#cont').attr('class', 'state-'+state)
    if (state == 'end') {
      el.find('.game-over .player-limit').toggle(!game.solved)
      el.find('.game-over .winner').toggle(!!game.solved)
      if (!!game.solved && game.leader) {
        el.find('.game-over .winner .winnername').text(game.players[game.leader].name)
      }
      el.find('.player').removeClass('current')
    }
    else if (state == 'pending') {
      game.initResult()
      el.find('.result-cpu table tbody').empty()
      el.find('.result-net-content .names').empty()
      el.find('.result-net-content .packets').empty()
      el.find('.result-leaderboard table tbody').empty()
    }
    
    game.lastangle = 0
    game.emit('update:start-btn')
    el.removeClass('is-my-move')
    clearTimeout(game.solveTimeout)
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
    game.emit('update:btn-join')
    game.emit('update:start-btn')
    game.renderArrow()
    if (player.id == game.myId) {
      el.find('#player'+player.id).addClass('is-me')
    }
  })
  game.on('del:player', function(playerId) {
    el.find('.players-joined').text(game.active.length)
    el.find('#player'+playerId).remove()
    game.renderPlayers()
    game.emit('update:btn-join')
    game.emit('update:start-btn')

    game.renderLeaderboard()
    game.renderArrow()
  })

  game.on('set:master', function(playerId) {
    // master player has right to start the game.
    game.emit('update:start-btn')
    if(game.players[playerId])
    el.find('.button-start-notmaster .mastername').text(
      game.players[playerId].name
    )
  })
  game.on('set:starttime', function(time) {
    //in seconds
    game.stopStartTimer()
    time = parseInt(time)
    if (time > 0) {
      $('#cont').addClass('starttime')
      $('.timer').text(parseInt(time));
      game.timerInterval = setInterval(function(){
        var val = parseInt($('.timer').text()) - 1
        if (val > 0) {
          $('.timer').text(parseInt($('.timer').text()) - 1)
        }
        else {
          game.stopStartTimer();
        }
      }, 1000)
    }
    game.emit('update:start-btn')
  })
  game.on('start', function(board) {
    // board -> Array(81)
    game.stopStartTimer()
    game.grid = new Grid(game, board)
    el.find('.play').empty().append(game.grid.el)
    console.log('got board', board)
  })
  game.stopStartTimer = function() {
    $('#cont').removeClass('starttime')
    clearInterval(game.timerInterval)
    game.timerInterval = 0
    game.emit('update:start-btn')
  }
  
  game.on('turn', function(playerId) {
    // move pointer arrow. if playerId == current then show buttons.
    el.find('.player').removeClass('current')
    el.find('#player' + playerId).addClass('current')
    
    if (game.state == 'active' && game.turn == game.myId && !!game.myId) {
      var checksolved = game.grid.getSolved()
      if (!checksolved) {
        el.addClass('is-my-move')
        game.solveStart = new Date
        el.find('.solve-timeout').text('')
        clearTimeout(game.solveTimeout)
        game.solveTimeout = setInterval(function() {
          el.find('.solve-timeout').text(
            ((new Date() - game.solveStart)/1000).toFixed(1) + 's')
        }, 100)
      }
      else {
        el.removeClass('is-my-move')
        remote.sendSolution({}, 2000, function(err, items) {})
      }
    }
    else {
      el.removeClass('is-my-move')
      clearTimeout(game.solveTimeout)
    }
    game.renderArrow()
  })

  game.initResult = function() {
    game.resultCpu = {}
    game.resultNet = {}
    game.resultNetSum = 0
    el.find('.result').removeClass('has-result')
  }

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

    el.find('.result-cpu').addClass('has-result')

    game.renderLeaderboard()
  })

  game.on('result:net', function(result) {
    // result -> {playerId, packets}
    var unit = 5
    var id = result.playerId
    if (typeof game.resultNet[id] == 'undefined') {
      game.resultNet[id] = {sum: result.packets}
      el.find('.result-net-content .names').append('<div class="row">'+ game.players[id].name +'</div>')
      el.find('.result-net-content .packets').append('<div class="row" id="rownet-'+ id +'"></div>')

    } else {
      game.resultNet[id].sum += result.packets
    }

    el.find('#rownet-'+id).append('<div class="packet" title="'+ result.packets +'KB" style="left:'+ (unit * game.resultNetSum) +'px; width:'+ (unit * result.packets + 4) +'px" />')
    game.resultNetSum += result.packets

    el.find('.result-net').addClass('has-result')
    
    game.renderLeaderboard()
  })

  game.renderPlayers = function() {
    var r = 110;
    var l = game.active.length
    var step = Math.PI * 2 / l
    for (var i = 0; i < l; i++) {
      var d = el.find('#player'+game.active[i])
      d
        .css('left', r + Math.round(r * Math.cos(i*step)) - d.width()*.5)
        .css('top', r + Math.round(r * Math.sin(i*step))- d.height() *.5)
    }
  }
  
  var spin = 0;
  game.renderArrow = function() {
    var i = game.active.indexOf(game.turn)
    if (-1 == i) {
      return
    }
    var l = game.active.length
    var step = Math.PI * 2 / l
    var arrow = el.find('.arrow')
    var angle = i*step + spin * Math.PI * 2;
    if (angle < game.lastangle ) {
      spin++
      angle += Math.PI * 2
    }
    arrow.css('-webkit-transform', 'rotate(' + (angle)+ 'rad)')
    arrow.css('-moz-transform', 'rotate(' + (angle)+ 'rad)')
    game.lastangle = angle
  }

  game.renderLeaderboard = function() {
    var data = []
    game.active.forEach(function(id) {
      var cpu, net
      if (game.resultCpu[id]) {
        cpu = game.resultCpu[id].sum / 1000
        net = game.resultNet[id] ? game.resultNet[id].sum : 0,
        data.push({
          id: id,
          name: game.players[id].name,
          cpu: cpu,
          net: net,
          sum: cpu + net
        })
      }
    })
    data.sort(function(a, b){
      return a.sum == b.sum ? 0 : (a.sum > b.sum ? 1 : -1)
    })
    game.leader = data.length ? data[0].id : ''
    el.find('.result-leaderboard table tbody').html($($rowleaderboard({data: data})))
    el.find('.result-leaderboard').addClass('has-result')
  }

  el.find('.button-join .btn').on('click', function() {
    function join() {
      remote.join({name: window.sessionStorage['myName']}, function(err, id) {
        if (err) {
          return alert(err.msg)
        }
        game.myId = id
      })
    }

    if (!window.sessionStorage['myName']) {
      game.showDialogPlayerData(join)

    } else {
      join()
    }
  })

  el.find('.button-start .btn').on('click', function() {
    remote.setStartTime(parseInt($('.button-start > input').val()) || 10, 
      function(err) {
        if (err) {
          alert(err.msg)
        }
      })
  })

  el.find('.button-solve').on('click', function() {
    remote.sendSolution(game.grid.buffer, new Date() - game.solveStart, function(err, items) {
      if (err) {
        return alert(err.msg)
      }
      game.grid.fill(items)
    })
  })



  el.find('.player-data').on('click', function() {
    game.showDialogPlayerData()
  })
  
  
  
  game.showDialogPlayerData = function(cb) {
    $playerdata = require('../views/playerdata.jade')
    var d = require('./dialog')($playerdata())
    $('#name').focus()
    $('.dialog-player-data .btn').on('click', function(){
      var val = $('.dialog-player-data #name').val()
      if (val) {
        window.sessionStorage['myName'] = val
        d.remove()
        game.emit('update:player-data')

        if (cb)
          cb()
      }
    })
  }


  $('#cont').html(el)
  
  
  var mux = new MuxDemux()
  mux.pipe(mx.createStream({room: room})).pipe(mux)
  
  mux.createStream('data').pipe(game)
  var d = dnode({
    mixSolution: function(items, cb) {
      console.log('mix', items);
      
      cb(null, game.grid.fill(items))
    }
  })
  d.on('remote', function(r) {
    global.remote = remote = r
  })
  d.pipe(mux.createStream('dnode')).pipe(d)
  global.game = game
  
  var closed
  mux.on('end', function(){
    if (!closed) {
      require('./router').navigate('/')
    }
  })
  
  return {
    dispose: function() {
      closed = true;
      mux.end()
    }
  }
}



/*
global.test = function(num) {
  var tests = {1: require('./test1')}
  var g = new Game()
  g.replicateStream().pipe(global.mx.createStream({push: global.room}))
  g.emit('clear')
  tests[num](g)
}

*/