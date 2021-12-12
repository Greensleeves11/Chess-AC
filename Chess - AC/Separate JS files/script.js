
// I used chess.js library for general mechanics (moves validation mainly), 
// but needed to make some changes in it e.g.:
//  - excluded, checkmate
//  - no draws on threefold repetition / 50 moves
//  - changed offsets of king and queen
//  - changed move range of queen
//  - changed default computer pawn promotion from random [q, b, r, n] to queen

// Code from chessboard.js library with my adjustments
let board = null
let game = new Chess('3qk3/8/pppppppp/8/8/PPPPPPPP/8/3QK3 w - - 0 1')
const $status = $('#status')
const $fen = $('#fen')
const $pgn = $('#pgn')


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (gameOver()) return false;

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}


function onDrop (source, target) {
  // see if the move is legal
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q' 
  })

  // illegal move
  if (move === null) return 'snapback'
}


// update the board position after the piece snap and then make AI move
function onSnapEnd () {
  board.position(game.fen())
    if (!gameOver()) window.setTimeout(makeSmartMove, 250)
  updateStatus();
}


function updateStatus () {
  let status = ''

    let moveColor = 'White'
    if (game.turn() === 'b') {
      moveColor = 'Black'
    }

    status = moveColor + ' to move'

    if (document.querySelector('[data-piece="wK"]') === null) {
      status = 'Game over, Black won';
    } 
    
    else if (document.querySelector('[data-piece="bK"]') === null) {
      status = 'Game over, White won';
    }  

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}


function gameOver() {
  let status = '';

  if (document.querySelector('[data-piece="wK"]') === null) {
    status = 'Game over, Black won';
    return true;
  } 
  
  else if (document.querySelector('[data-piece="bK"]') === null) {
    status = 'Game over, White won';
    return true;
  } 
}


const config = {
    position: '3qk3/8/pppppppp/8/8/PPPPPPPP/8/3QK3',
    draggable: true,
    moveSpeed: 'fast',
    snapbackSpeed: 300,
    snapSpeed: 100,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  }


board = ChessBoard('board', config);
updateStatus();


// Buttons 
$('#startBtn').on('click', () => {
  const startingPosition = '3qk3/8/pppppppp/8/8/PPPPPPPP/8/3QK3';
  board.position(startingPosition);
  game = new Chess('3qk3/8/pppppppp/8/8/PPPPPPPP/8/3QK3 w - - 0 1');
  updateStatus();
});
$('#flipOrientationBtn').on('click', board.flip);
$('#flipOrientationBtn').on('click', makeRandomMove);

