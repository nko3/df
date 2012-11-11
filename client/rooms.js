var rooms = require('../data/rooms')

exports.init = function(mx) {
  
  $('#cont').empty()
  
  var $addroom = require('../views/addroom.jade')
  var el = $($addroom({}))
  el.find('.button-add').on('click', function() {
    addRoom({name: $('#name').val(), limit: parseInt($('#player-limit').val()) || 8})
  })
  $('#cont').append(el)

  var main = mx.createStream('main')
  main.pipe(rooms)
  
  return {
    dispose: function (){
      console.log('close:main')
      main.end()
    }
  }
  
}

rooms.on('add:room', function(r) {
  var $room = require('../views/room.jade')
  var el = $($room(r))
  el.attr('id', 'room-' + r.id)
  el.find('.button-open').on('click', function() {
    require('./router').navigate('/p/' + r.id)
  })
  $('#addroom').before(el)
})

rooms.on('del:room', function(id) {
  $('#room-' + id).remove()
})

rooms.on('set:watchers', function(id, count) {
  $('#room-' + id).find('.watchers > .count').text(count)
})

rooms.on('set:joined', function(id, count) {
  $('#room-' + id).find('.players > .joined').text(count)
})


global.addRoom = function (data) {
  $.ajax({
    type: 'POST',
    url: '/new',
    dataType: 'json',
    data: data
  }).done(function(data) {
    console.log('Posted', data);
  }).fail(function(e) {
    throw(e)
  })
}