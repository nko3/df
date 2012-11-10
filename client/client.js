$ = require('jquery-browserify')

$game = require('../views/game.jade')

$(function(){
  $('#cont').html($game({name: 'foo'}))
  console.log('loaded')
})
