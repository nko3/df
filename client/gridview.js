function Grid(board) {
  var $grid = require('../views/grid.jade')
  var el = this.el = $($grid())
  
  this.values = board
  this.active = []
  this.els = []
  
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
    
    self.els.push(tile)
    tiles.append(tile)
  })
  
  var controls = $(el[1])
  for (var i = 1; i <= 9; i++) {
    tile = $('<div></div>')
    tile.addClass('control')
    tile.text(i)
    controls.append(tile)
  }
  
}

exports.Grid =  Grid