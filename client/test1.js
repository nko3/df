function test(game) {
  
  game.emit('init', {name: 'roomtest1', limit: 10})
  game.emit('set:watchers', 3)
  game.emit('set:state', 'pending')
  
  game.emit('add:player', {id: 11, name: 'John'})
  game.emit('add:player', {id: 12, name: 'Paul'})
  game.emit('set:master', 11)
  
  setTimeout(function() {
    game.emit('add:player', {id: 13, name: 'Ringo'})
    game.emit('add:player', {id: 14, name: 'George'})
  }, 2000)
  
  setTimeout(function() {
    game.emit('set:starttime', 5)
    game.emit('set:watchers', 5)
  }, 3000)
  
  setTimeout(function() {
    game.emit('start', new Array(81))
    game.emit('set:state', 'active')
    game.emit('turn', 12)
  }, 8000)

  setTimeout(function() {
    game.emit('result:cpu', {playerId: 12, time: 800, ping: 300})
    game.emit('result:net', {playerId: 12, packets: 1})
    game.emit('turn', 13)
    game.emit('set:watchers', 4)
  }, 10000)

  setTimeout(function() {
    game.emit('result:cpu', {playerId: 13, time: 500, ping: 250})
    game.emit('result:net', {playerId: 13, packets: 2})
    game.emit('turn', 11)
  }, 11000)

  setTimeout(function() {
    game.emit('result:cpu', {playerId: 11, time: 1250, ping: 200})
    game.emit('result:net', {playerId: 11, packets: 3})
    game.emit('turn', 12)
    game.emit('del:player', 13)
    game.emit('set:watchers', 7)
  }, 12000)
  
  setTimeout(function() {
    game.emit('result:cpu', {playerId: 13, time: 1250, ping: 200})
    game.emit('result:net', {playerId: 13, packets: 4})
  }, 13000)

  setTimeout(function(){
    game.emit('result:cpu', {playerId: 12, time: 1250, ping: 200})
    game.emit('result:net', {playerId: 12, packets: 1})
  }, 14000)

  setTimeout(function(){
    game.emit('result:cpu', {playerId: 11, time: 1150, ping: 200})
    game.emit('result:net', {playerId: 11, packets: 4})
  }, 15000)

  setTimeout(function(){
    game.emit('result:cpu', {playerId: 13, time: 1150, ping: 200})
    game.emit('result:net', {playerId: 13, packets: 20})
  }, 16000)

  setTimeout(function(){
    game.emit('result:cpu', {playerId: 14, time: 1950, ping: 200})
    game.emit('result:net', {playerId: 14, packets: 50})
  }, 17000)
  
  /*setTimeout(function() {
    game.emit('set:state', 'end')
  }, 18000)

  setTimeout(function() {
    game.emit('set:state', 'pending')
  }, 19000)*/
  

}

module.exports = test