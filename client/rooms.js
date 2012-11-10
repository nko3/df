var rooms = require('../data/rooms')

exports.init = function(mx) {
  
  $('#cont').empty()
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
  el.find('.open').on('click', function() {
    require('./router').navigate('/p/' + r.id)
  })
  $('#cont').append(el)
})

rooms.on('del:room', function(id) {
  $('#room-' + id).remove()
})

rooms.on('set:watchers', function(count) {
  $('#room-' + id).find('.watchers').text(count)
})

rooms.on('set:joined', function(count) {
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