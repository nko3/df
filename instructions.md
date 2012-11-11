##Welcome to Nodoku

Nodoku is a multiplayer sudoku-like game built for NKO3. It adds ideas introduced by Node.JS to this old and boring game to make it more fun.


##Nodoku rules:

- All action happens in a single event loop.
- You DO NOT block the Event loop.
- I/O (slow thinking) is asynchronous.
- Used CPU/Bandwidth will cost you a lower score.





All players are placed in a circle in fixed order.
You can only interact with the game when its your turn.
When its your turn the movement is blocked until you release the lock.


When game starts all players receive a (easy) sudoku puzzle.
All players solve the same puzzle.
When its your turn

  - you can send away parts of the puzzle you have solved.
  - parts solved by other people are loaded into your puzzle.



###Scoring:

Scoring takes place in 2 parts:

You get penalty for blocking the loop. Stopwatch will count the time the loop was blocked because of you and show it in the profiler.

Every square that was solved by other players before and got loaded into an empty slot on your puzzle will count as your network traffic.

Penalty for one square loaded in equals the penalty for blocking the loop for one second.