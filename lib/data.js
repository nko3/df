/**
* Experimental data store test
* - Dynamic data, any JS object structure
* - All changes evented
* - Stream based replication/syncronization
* - Parts inspired by substack/emit-stream
* - Persistence can be done via dominictarr/kv
**/

var Stream = require('stream').Stream
var through = require('through')

function DataStream() {
  // todo: clear if not inited
  this.writable = true;
  this._emit = this.emit
  var self = this
  this.emit = function () {
    if (self._replicateStreams) {
      var args = [].slice.call(arguments)
      self._replicateStreams.forEach(function (s) {
        s.write(args)
      })
    }
    self._emit.apply(self, arguments)
  }
  this.write = function(data) {
    self.emit.apply(self, data)
  }
  this.end = function() {}
  this.on('pipe', function() {
    self._emit('clear')
  })
}
DataStream.prototype = Object.create(Stream.prototype)

DataStream.prototype.replicateStream = function() {
  var self = this
  var nextTick, ended, stack = []
  var s = through(
    function write (args) {
      if (nextTick) s.emit('data', args)
      else stack.push(args)
    },
    function end () {
      if (!nextTick) {
        ended = true
      }
      else {
        var ix = self._replicateStreams.indexOf(s)
        self._replicateStreams.splice(ix, 1)
        s.emit('end')
      }
    }
  )
  process.nextTick(function() {
    nextTick = true
    stack.forEach(s.write)
    if (ended) s.end()
  })
  this._emit('replicate', {
    emit: function () {
      s.write([].slice.call(arguments))
    }
  })
  
  if (!this._replicateStreams) this._replicateStreams = []
  this._replicateStreams.push(s)
  
  return s
}

module.exports = DataStream
