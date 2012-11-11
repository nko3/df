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
  var tiles = $(el[0])
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
    if (this.buffer[i]) delete this.buffer[i]
    if (this.active == i) {
      this.emit('set:active', -1)
    }
  }
  return num
}

Grid.prototype.input = function(c) {
  if (this.selected != -1 && /[1-9]/.test(c) && this.active[this.selected] == true) {
    $(this.els[this.selected]).text(c)
    this.buffer[this.selected] = parseInt(c)
    this.emit('change')
  }
}


exports.Grid =  Grid