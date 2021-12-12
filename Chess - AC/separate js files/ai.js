// AI part
const piecesWeight = {
    p: 100,
    q: 1000,
    k: 100000
}

// piece-square tables
const pstWhite = {
    p: [
        [ 5,   5,   5,   5,   5,   5,   5,   5 ],
        [ 5,   5,   5,   5,   5,   5,   5,   5 ],
        [ 3,   3,   4,   5,   5,   4,   3,   3 ],
        [ 2,   2,   3,   4,   4,   3,   2,   2 ],
        [ 1,   1,   1,   2,   2,   1,   1,   1 ],
        [ 0,   0,   0,   0,   0,   0,   0,   0 ],
        [ 0,   0,   0,   0,   0,   0,   0,   0 ],
        [ 0,   0,   0,   0,   0,   0,   0,   0 ]
       ],

    q: [
        [  -3,  -2,  -1,   0,   0,  -1,  -2,  -3],
        [  -2,   0,   1,   1,   1,   1,   0,  -2],
        [   0,   1,   2,   2,   2,   2,   1,   0],
        [   0,   1,   2,   2,   2,   2,   1,   0],
        [   0,   1,   2,   2,   2,   2,   1,   0],
        [   0,   1,   2,   2,   2,   2,   1,   0],
        [  -2,   0,   1,   1,   1,   1,   0,  -2],
        [  -3,  -2,  -1,   0,   0,  -1,  -2,  -3]
       ],

    k: [
        [  -3,  -4,  -4,  -5,  -5,  -4,  -4,  -3],
        [  -3,  -4,  -4,  -5,  -5,  -4,  -4,  -3],
        [  -3,  -4,  -4,  -5,  -5,  -4,  -4,  -3],
        [  -3,  -4,  -4,  -5,  -5,  -4,  -4,  -3],
        [  -2,  -3,  -3,  -4,  -4,  -3,  -3,  -2],
        [  -1,  -2,  -2,  -2,  -2,  -2,  -2,  -1],
        [   1,   1,   0,   0,   0,   0,   1,   1],
        [   1,   3,   1,   0,   0,   1,   3,   1]
       ],
}

// reverse is a destructive method so needed to use slice before
const pstBlack = {
    p: pstWhite.p.slice().reverse(),
    q: pstWhite.q.slice().reverse(),
    k: pstWhite.k.slice().reverse()
}

// take player's move and translate it to certain position on PST table
const translateMoveToPST = function(move) {

    const first = (8 - parseInt(move.to.charAt(1))).toString();
    let second = move.to.charAt(0);

    if (second === 'a') {
        second = 0;
    } else if (second === 'b') {
        second = 1;
    } else if (second === 'c') {
        second = 2;
    } else if (second === 'd') {
        second = 3;
    } else if (second === 'e') {
        second = 4;
    } else if (second === 'f') {
        second = 5;
    } else if (second === 'g') {
        second = 6;
    } else {
        second = 7;
    }

    second = second.toString();
    return  first + second;
}

// calculate how many points players gets from this move (based only on position)
const evaluateMove = function(moveIndices, move) {
    
    if (game.turn() === 'b') {

        if (move.piece === 'p') {
            return pstWhite.p[moveIndices[0]][moveIndices[1]];
        } else if (move.piece === 'q') {
            return pstWhite.q[moveIndices[0]][moveIndices[1]];
        } else {
            return pstWhite.k[moveIndices[0]][moveIndices[1]];
        } 
       
    } else {
        if (move.piece === 'p') {
            return pstBlack.p[moveIndices[0]][moveIndices[1]];
        } else if (move.piece === 'q') {
            return pstBlack.q[moveIndices[0]][moveIndices[1]];
        } else {
            return pstBlack.k[moveIndices[0]][moveIndices[1]];
        }
    }  
}

// make the best move but without predicting what might happen next
const makeMove = function() {

    const moves = game.moves();
    // array of possible moves need to be shuffled in order to diversify moves in case of the same pst value
    const shuffledMoves = shuffleArray(moves);
    // best score will store [0] - score for the best move and [1] - the best move itself
    let bestScore = [-1000000000];
    
    // iterate over each possible move and choose the one with the highest score
    for (let i = 0; i < shuffledMoves.length; i++) {
        let move = game.move(shuffledMoves[i]);
        let moveIndices = translateMoveToPST(move)
        let tempScore = evaluateMove(moveIndices, move);

        // add points for capturing an opponent's piece
        if (move.captured === 'p') {
            tempScore += piecesWeight.p;
        } else if (move.captured === 'q') {
            tempScore += piecesWeight.q;
        } else if (move.captured === 'k') {
            tempScore += piecesWeight.k;
        }

        if (tempScore > bestScore[0]) {
            bestScore[0] = tempScore;
            bestScore[1] = shuffledMoves[i];
        }

        // we need to undo the move in order to be able to check the next one
        // but the board is not updated so all of this is working under the hood
        game.undo();
    }

    game.move(bestScore[1]);
    return bestScore;
}


const shuffleArray = function(array) {

    const result = [];

    while(array.length > 0) {
        result.push(array.splice([Math.floor(Math.random() * array.length)], 1).toString());
    }

    return result;
}


// make the best move but look ahead to what might happen in next 4 turns (2 white's, 2 black's)
const makeSmartMove = function() {

    let movePoints = -10000000;
    let substractPoints = 0;
    let bestMove;

    let moves = game.moves();
    let shuffledMoves = shuffleArray(moves);
    
    for (let i = 0; i < shuffledMoves.length; i++) {
        let move = game.move(shuffledMoves[i]);
        let moveIndices = translateMoveToPST(move)
        points = evaluateMove(moveIndices, move);

        if (move.captured === 'p') {
            points += piecesWeight.p;
        } else if (move.captured === 'q') {
            points += piecesWeight.q;
        } else if (move.captured === 'k') {
            points += piecesWeight.k;
        }
 
        if (game.moves().length === 0 || move.captured === 'k') {
            bestMove = move;
            game.undo();
            break;
        }

        // simulate opponent's move
        substractPoints = makeMove()[0];

        // simulate next AI's move
        let x = makeMove()[0];
        
        if (game.moves().length === 0) {
            game.undo();
            game.undo();
            continue;         
        }

        // again simulate opponent's move and do the math
        let y = makeMove()[0];
        points += x;
        substractPoints += y;

        if (points - substractPoints > movePoints) {
            movePoints = points;
            movePoints -= substractPoints;     
            bestMove = move;      
        }

        substractPoints = 0;
        points = 0;
        game.undo();            
        game.undo();            
        game.undo();            
        game.undo();                        
    }

    // make selected move on the board and make updates
    game.move(bestMove.san);
    board.position(game.fen());
    setTimeout(updateStatus, 250);      
}