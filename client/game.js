var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function Game() {
  
}
inherits(Game, EventEmitter)

Game.prototype.join = function(playerdata, cb) {
  // playerdata -> {name, avatar}
  // cb -> f(err, playerId)
}

Game.prototype.sendSolution = function(solution, cb) {
  // solution -> {index1: val1, index2: val2}
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