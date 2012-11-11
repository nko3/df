var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function Grid(game, board) {
  EventEmitter.call(this)
  this.game = game
  
  var $grid = require('../views/grid.jade')
  var el = this.el = $($grid())
  
  this.values = board
  this.active = []
  this.els = []
  
  this.buffer = {}
  
  var self = this
  var tiles = this.tiles = $(el[0])
  board.forEach(function(c){
    var tile = $('<div class="tile"></div>')
    
    if (c == null) {
      tile.addClass('active')
      self.active.push(true)
    }
    else {
      self.active.push(false)
      tile.text(c)
    }
    
    self.els.push(tile[0])
    tiles.append(tile)
  })
  
  tiles.find('.tile.active').live('click', function(e){
    if (self.game.myId) {
      self.emit('set:active', self.els.indexOf(e.target))
    }
    else {
      alert('You have to join before you can play along')
    }
  })
  
  var controls = $(el[1])
  for (var i = 1; i <= 9; i++) {
    tile = $('<div></div>')
    tile.addClass('control')
    tile.text(i)
    controls.append(tile)
    ;(function(i){
      tile.on('click', function(){
        self.input(i)
      })
    })(i)
  }
  
  this.on('set:active', function(index) {
    self.selected = index
    controls.toggleClass('visible', self.selected != -1)
    tiles.find('.tile').removeClass('selected')
    $(self.els[index]).addClass('selected')
  })
  
  this.emit('set:active', -1)
  
  $(window).on('keyup', function(e) {
    self.input(String.fromCharCode(e.keyCode))
  })
  
  ;[18, 45].forEach(function(i) {
    for (var j = 0; j < 9; j++)
      $(self.els[i + j]).addClass('bb')
  })
  ;[27, 54].forEach(function(i) {
    for (var j = 0; j < 9; j++)
      $(self.els[i + j]).addClass('bt')
  })
  ;[2, 5].forEach(function(i) {
    for (var j = 0; j < 9; j++)
      $(self.els[i + j * 9]).addClass('br')
  })
  ;[3, 6].forEach(function(i) {
    for (var j = 0; j < 9; j++)
      $(self.els[i + j * 9]).addClass('bl')
  })
  
}
inherits(Grid, EventEmitter)

Grid.prototype.fill = function(items) {
  var num = 0
  for (var i in items) {
    var el = $(this.els[i])
    this.active[i] = false
    el.removeClass('active')
    if (parseInt(items[i]) != parseInt(el.text())){
      num++
    }
    el.text(items[i])
    this.values[i] = parseInt(items[i])
    if (this.buffer[i]) delete this.buffer[i]
    if (this.active == i) {
      this.emit('set:active', -1)
    }
  }
  this.renderErrors()
  return num
}

Grid.prototype.input = function(c) {
  if (this.selected != -1 && /[1-9]/.test(c) && this.active[this.selected] == true) {
    $(this.els[this.selected]).text(c)
    this.values[this.selected] = parseInt(c)
    this.buffer[this.selected] = parseInt(c)
    this.emit('change')
    this.renderErrors()
  }
}

Grid.prototype.getSolved = function() {
  for (var i = 0; i < this.active.length; i++) {
    if (this.active[i]) return false
  }
  return true
}

Grid.prototype.renderErrors = function() {
  $(this.tiles).find('.tile').removeClass('error')
  
  // by row
  for (var r = 0; r < 9; r++) {
    for (var c = 0; c < 9; c++) {
      for (var i = c + 1; i < 9; i++) {
        if (this.values[r * 9 + c]
          && this.values[r * 9 + c] == this.values[r * 9 + i]) {
            $(this.els[r * 9 + c]).addClass('error')
            $(this.els[r * 9 + i]).addClass('error')
          }
      }
    }
  }
  
  // by column
  for (c = 0; c < 9; c++) {
    for (r = 0; r < 9; r++) {
      for (i = r + 1; i < 9; i++) {
        if (this.values[r * 9 + c]
          && this.values[r * 9 + c] == this.values[i * 9 + c]) {
            $(this.els[r * 9 + c]).addClass('error')
            $(this.els[i * 9 + c]).addClass('error')
          }
      }
    }
  }
  
  // by block (really stupid solution)
  var base = [0, 3, 6, 27, 30, 33, 54, 57, 60]
  var inc = [0, 1, 2, 9, 10, 11, 18, 19, 20]
  
  for (var r = 0; r < 9; r++) {
    for (var c = 0; c < 9; c++) {
      for (var i = c + 1; i < 9; i++) {
        if (this.values[base[r] + inc[c]]
          && this.values[base[r] + inc[c]] == this.values[base[r] + inc[i]]) {
            $(this.els[base[r] + inc[c]]).addClass('error')
            $(this.els[base[r] + inc[i]]).addClass('error')
          }
      }
    }
  }
  
}

exports.Grid =  Grid