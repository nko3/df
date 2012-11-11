var sudoku = require('sudoku');
var MuxDemux = require('mux-demux')
var puzzle     = sudoku.makepuzzle();
var solution   = sudoku.solvepuzzle(puzzle);
var difficulty = sudoku.ratepuzzle(puzzle, 4);

puzzle = puzzle.map(function(n) {return n == null ? n : n + 1})
solution = solution.map(function(n) {return n == null ? n : n + 1})

var empty = puzzle.reduce(function(memo, val){
  return val == null ? ++memo : memo
}, 0)


while (empty > 10) {
  var rand = Math.floor(Math.random() * 81)
  if (puzzle[rand] != null) continue;
  
  puzzle[rand] = solution[rand]
  empty--
}
var empty = puzzle.reduce(function(memo, val){
  return val == null ? ++memo : memo
}, 0)

var mx = new MuxDemux()
mx.pipe(process.stdout)

mx.createStream('board').write({puzzle: puzzle, solution:solution})
