
const WHITE = 'w';
const BLACK = 'b';
const EMPTY = '';

const CAPTURE_INDICATOR = 'x';

const CASTLE_INDICATOR = 'o';
const SHORT_CASTLE = 'oo';
const LONG_CASTLE = 'ooo';

const KING = 'k';
const QUEEN = 'q';
const ROOK = 'r';
const BISHOP = 'b';
const KNIGHT = 'n';
const PAWN = 'p';

const PIECE_TYPES = [KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


class Coordinates {
    constructor (file, rank) {
        this.file = parseInt(file);
        this.rank = parseInt(rank);
    }

    toString() {
        return `(${this.file}, ${this.rank})`
    }
}


class Move {
    constructor (origin, destination, is_capture=false) {
        this.origin = origin;
        this.destination = destination;
        this.is_capture = is_capture;
    }

    toString() {
        return `${this.origin} -> ${this.destination}`
    }
}

class Piece {
    /* Build a piece object from a piece html element */
    constructor(htmlElement) {
        /* 
            Example: <div class="piece [color (w/b)][type] square-[file][rank]" 
            To Note: The classList can appear in any order, so we can't rely on
                     the order of the classes in the htmlElement.classList array
        */

        const classList = htmlElement.classList;

        classList.forEach(className => {
            if (className.startsWith('piece')) { return; }

            if (className.startsWith('square')) {
                const pos_info = className.split('-')[1];

                const file = pos_info.slice(0, 1);
                const rank = pos_info.slice(1);

                this.coordinates = new Coordinates(file, rank);

                return;
            }

            this.type = className.slice(1);
            this.color = className.slice(0, 1);
        });

        /* Capitalize the type if the piece is white */
        if (this.color == WHITE) {
            this.type = this.type.toUpperCase();
        } else {
            // Should already be lowercase, but just in case
            this.type = this.type.toLowerCase();
        }

        this.htmlElement = htmlElement;
    }

    toString() {
        return `${this.color}-${this.type} (${this.file}, ${this.rank})`
    }
}

const build_board = () => {

    const board_element = document.getElementById('board-single') ? 
                          document.getElementById('board-single') : 
                          document.getElementById('board-play-computer');
    
    const pieces = Array.from(board_element.children).filter(
        child => String(child.className).startsWith('piece')
    );

    const board = Array(8).fill().map(() => Array(8).fill(''));

    pieces.forEach(piece_html => {
        const piece = new Piece(piece_html);

        board[piece.coordinates.rank - 1][piece.coordinates.file - 1] = piece;
    });

    return board;
}

const get_position_pgn = (board) => {

    let PGN = '';
    let whitespace_counter = 0;

    /* 
        Loop backwards and left-right to get the PGN.
        PGN is recorded from the black side first.
    */
    for(let i = board.length - 1; i >= 0; i--) {
        for(let j = 0; j < board.length; j++) {
            if (board[i][j] == EMPTY) {
                whitespace_counter++;
                continue;
            }

            if (whitespace_counter !== 0) {
                PGN += whitespace_counter;
                whitespace_counter = 0;
            }

            PGN += board[i][j].type;
        }

        if (whitespace_counter !== 0) {
            PGN += whitespace_counter;
            whitespace_counter = 0;
        }

        if (i !== 0) {
            PGN += '/';
        }
    }

    return PGN;
}

const get_turn = (board, last_move_pair) => {

    const move_coords = [];

    last_move_pair.forEach(html_move => {
        html_move.classList.forEach(className => {
            if (className.startsWith('square')) {
                const pos_info = className.split('-')[1];

                const file = pos_info.slice(0, 1);
                const rank = pos_info.slice(1);

                move_coords.push(new Coordinates(file, rank));
            }
        });
    });

    let last_moved_piece;

    move_coords.forEach(coord => {
        if (board[coord.rank - 1][coord.file - 1] == EMPTY) {
            return;
        }

        last_moved_piece = board[coord.rank - 1][coord.file - 1];
    });

    if (last_moved_piece.color == WHITE) {
        return BLACK;
    }

    return WHITE;
}


const create_full_pgn = async () => {

    const board_element = document.getElementById('board-single') ?
                          document.getElementById('board-single') :
                          document.getElementById('board-play-computer');

    const last_move_pair = Array.from(board_element.children).filter(
        child => String(child.className).startsWith('highlight')
    );

    const board = build_board();

    const current_turn = get_turn(board, last_move_pair);
    
    const PGN = get_position_pgn(board) + ' ' + current_turn;

    return PGN;
};


const get_player_color = async () => {

    const board_element = document.getElementById('board-single') ? 
                          document.getElementById('board-single') : 
                          document.getElementById('board-play-computer');

    if (board_element.classList.contains("flipped")) {
        return BLACK;
    }

    return WHITE;
}


const parse_move = async (move_text) => {
    const player_color = await get_player_color();

    const board = build_board();

    if (move_text.length === 0) { return; }

    /* Mess with the logic a little because 'b' is a valid file,
       and 'B' is a valid piece type, so if we lowercase the move_text
       then we can't tell if it's a file or a piece type.
    */
    const is_pawn_move = FILES.includes(move_text.slice(0, 1));

    move_text = move_text.trim().toLowerCase();

    /* Check for pawn move (starts with file) */
    if (is_pawn_move) {
        return _create_pawn_move(board, move_text, player_color);
    }
    
    /* Check for castling (starts with 'O') */
    if (move_text.slice(0, 1) === CASTLE_INDICATOR) {
        
        /* Remove possible dashes */
        move_text = move_text.split('-').join('');

        return _create_castle_move(move_text, player_color);
    }

    /* Check for any other piece move */
    const piece_type = move_text.slice(0, 1);

    const possible_pieces = _find_pieces(board, piece_type, player_color);

    if (possible_pieces.length === 0) { return; }

    const is_capture = move_text.slice(1, 2) === CAPTURE_INDICATOR;

    const text_destination = is_capture ? move_text.slice(2) : move_text.slice(1);

    const destination = _notation_to_coordinates(text_destination);

    let origin;

    possible_pieces.forEach(piece => {
        if (_piece_can_move_to(board, piece, destination)) {
            origin = piece.coordinates;
        }
    });

    if (origin) {
        return new Move(origin, destination, is_capture);
    }
    
    return;
}

const make_move = (move) => {

    const board_element = document.getElementById('board-single') ? 
                          document.getElementById('board-single') : 
                          document.getElementById('board-play-computer');

    const board_square = board_element.querySelector(`.square-${move.origin.file}${move.origin.rank}`);

    const squareWidth = board_square.getBoundingClientRect().width;
    const offsetX = board_element.getBoundingClientRect().x;
    const offsetY = board_element.getBoundingClientRect().y;
    const bubbles = true;

    // mouse down on the center of the e2 square
    let clientX = squareWidth * (move.origin.file - 0.5) + offsetX;
    let clientY = squareWidth * (8 - move.origin.rank + 0.5) + offsetY;
    let event = new PointerEvent('pointerdown', { clientX, clientY, bubbles });
    
    board_element.dispatchEvent(event);

    // mouseup on the center of the e3 square
    clientX = squareWidth * (move.destination.file - 0.5) + offsetX;
    clientY = squareWidth * (8 - move.destination.rank + 0.5) + offsetY;
    
    console.log((move.origin.file - 0.5), (8 - move.origin.rank + 0.5))

    event = new PointerEvent('pointerup', { clientX, clientY, bubbles });
    board_element.dispatchEvent(event);
}


const _find_pieces = (board, piece_type, player_color) => {
    const results = [];

    board.forEach( row => {
        row.forEach( piece => {
            if (piece == EMPTY) { return; }
            if (piece.type.toLowerCase() === piece_type && piece.color === player_color) {
                results.push(piece);
            }
        });
    });

    return results;
}

const _piece_can_move_to = (board, piece, destination) => {

    if (piece.type.toLowerCase() === KING) {
        return _king_can_move_to(board, piece, destination);
    } else if (piece.type.toLowerCase() === QUEEN) {
        return _queen_can_move_to(board, piece, destination);
    } else if (piece.type.toLowerCase() === ROOK) {
        return _rook_can_move_to(board, piece, destination);
    } else if (piece.type.toLowerCase() === BISHOP) {
        return _bishop_can_move_to(board, piece, destination);
    } else if (piece.type.toLowerCase() === KNIGHT) {
        return _knight_can_move_to(board, piece, destination);
    } else if (piece.type.toLowerCase() === PAWN) {
        return _pawn_can_move_to(board, piece, destination);
    }

    return false;
}

const _king_can_move_to = (board, piece, destination) => {
    
    const origin = piece.coordinates;

    if (Math.abs(origin.file - destination.file) > 1) {
        return false;
    }

    if (Math.abs(origin.rank - destination.rank) > 1) {
        return false;
    }

    return true;
}

const _queen_can_move_to = (board, piece, destination) => {
    const origin = piece.coordinates;

    if (origin.file === destination.file) {
        return _rook_can_move_to(board, piece, destination);
    }

    if (origin.rank === destination.rank) {
        return _rook_can_move_to(board, piece, destination);
    }

    return _bishop_can_move_to(board, piece, destination);
}

const _rook_can_move_to = (board, piece, destination) => {
    const origin = piece.coordinates;

    if (origin.file === destination.file) {
        const min = Math.min(origin.rank - 1, destination.rank - 1);
        const max = Math.max(origin.rank - 1, destination.rank - 1);

        for(let i = min + 1; i < max; i++) {
            if (board[i][origin.file - 1] !== EMPTY) {
                return false;
            }
        }

        /* Check if destination is not occupied by a piece of the same color */
        if (board[destination.rank - 1][destination.file - 1] === EMPTY) {
            return true;
        }

        if (board[destination.rank - 1][destination.file - 1].color !== piece.color) {
            return true;
        }
    }

    if (origin.rank === destination.rank) {
        const min = Math.min(origin.file - 1, destination.file - 1);
        const max = Math.max(origin.file - 1, destination.file - 1);

        for(let i = min + 1; i < max; i++) {
            if (board[origin.rank - 1][i] !== EMPTY) {
                return false;
            }
        }

        /* Check if destination is not occupied by a piece of the same color */
        if (board[destination.rank - 1][destination.file - 1] === EMPTY) {
            return true;
        }

        if (board[destination.rank - 1][destination.file - 1].color !== piece.color) {
            return true;
        }
    }

    return false;
}

const _bishop_can_move_to = (board, piece, destination) => {
    const origin = piece.coordinates;

    const file_diff = Math.abs(origin.file - destination.file);
    const rank_diff = Math.abs(origin.rank - destination.rank);

    if (file_diff !== rank_diff) {
        return false;
    }

    const file_direction = origin.file < destination.file ? 1 : -1;
    const rank_direction = origin.rank < destination.rank ? 1 : -1;

    for(let i = 1; i < file_diff; i++) {
        if (board[origin.rank - 1 + i * rank_direction][origin.file - 1 + i * file_direction] !== EMPTY) {
            return false;
        }
    }

    /* Check if destination is not occupied by a piece of the same color */
    if (board[destination.rank - 1][destination.file - 1] === EMPTY) {
        return true;
    }

    if (board[destination.rank - 1][destination.file - 1].color !== piece.color) {
        return true;
    }

    return false;
}

const _knight_can_move_to = (board, piece, destination) => {
    const origin = piece.coordinates;

    const file_diff = Math.abs(origin.file - destination.file);
    const rank_diff = Math.abs(origin.rank - destination.rank);

    if (file_diff === 2 && rank_diff === 1) {
        return true;
    }

    if (file_diff === 1 && rank_diff === 2) {
        return true;
    }

    return false;
}

const _pawn_can_move_to = (board, piece, destination, is_capture=false) => {
    if (is_capture) {
        if (Math.abs(piece.coordinates.file - destination.file) !== 1) {
            return false;
        }

        if (Math.abs(piece.coordinates.rank - destination.rank) !== 1) {
            return false;
        }

        if (board[destination.rank - 1][destination.file - 1] === EMPTY) {
            return false;
        }

        if (board[destination.rank - 1][destination.file - 1].color === piece.color) {
            return false;
        }

        return true;
    }

    if (piece.color === WHITE) {
        if (piece.coordinates.rank === 2) {
            if (destination.rank === 4) {
                if (board[3][destination.file - 1] !== EMPTY) {
                    return false;
                }

                return true;
            }
        }

        if (destination.rank - piece.coordinates.rank !== 1) {
            return false;
        }

        if (board[destination.rank - 1][destination.file - 1] !== EMPTY) {
            return false;
        }

        return true;
    }

    if (piece.coordinates.rank === 7) {
        if (destination.rank === 5) {
            if (board[4][destination.file - 1] !== EMPTY) {
                return false;
            }

            return true;
        }
    }

    if (piece.coordinates.rank - destination.rank !== 1) {
        return false;
    }

    if (board[destination.rank - 1][destination.file - 1] !== EMPTY) {
        return false;
    }

    return true;
}

const _create_pawn_move = (board, move_text, player_color) => {
    const is_capture = move_text.slice(1, 2) === CAPTURE_INDICATOR;

    if (is_capture) {
        const destination = _notation_to_coordinates(move_text.slice(2));
        const origin_file = _file_to_number(move_text.slice(0, 1));

        const origin_rank = player_color === WHITE ? 
                            destination.rank - 1 :
                            destination.rank + 1;

        const piece = board[origin_rank - 1][origin_file - 1];

        if (piece === EMPTY) { return; }

        if(!_pawn_can_move_to(board, piece, destination, true)) {
            return;
        }

        return new Move(
            new Coordinates(origin_file, origin_rank),
            destination,
            true
        );
    }

    const destination = _notation_to_coordinates(move_text);

    if ( (player_color === WHITE && destination.rank === 4) ||
            (player_color === BLACK && destination.rank === 5)) {
            const origin = _resolve_pawn_double_move(
                board,
                destination,
                player_color
            );
    
            if (origin === undefined) { return; }
    
            return new Move(origin, destination, false);
        }

    const origin = new Coordinates(
        destination.file,
        player_color === WHITE ? destination.rank - 1 : destination.rank + 1
    );

    if (board[origin.rank - 1][origin.file - 1] === EMPTY) { return; }

    if (!_pawn_can_move_to(board, board[origin.rank - 1][origin.file - 1], destination)) {
        return;
    }

    return new Move(origin, destination, false);
}


const _create_castle_move = (move_text, player_color) => {
    if (move_text === SHORT_CASTLE) {
        if (player_color === WHITE) {
            return new Move(
                new Coordinates(5, 1),
                new Coordinates(7, 1),
                false
            )
        }

        return new Move(
            new Coordinates(4, 1),
            new Coordinates(2, 1),
            false
        )
    }

    if (move_text === LONG_CASTLE) {
        if (player_color === WHITE) {
            return new Move(
                new Coordinates(5, 1),
                new Coordinates(3, 1),
                false
            )
        }

        return new Move(
            new Coordinates(4, 1),
            new Coordinates(6, 1),
            false
        )
    }

    return;
}

const _resolve_pawn_double_move = (board, destination, player_color) => {

    if (player_color === WHITE && destination.rank === 4) {
        if (board[2][destination.file - 1] === EMPTY) {
            return new Coordinates(destination.file, 2);
        }

        return new Coordinates(destination.file, 3);
    }

    if (player_color === BLACK && destination.rank === 5) {
        if (board[5][destination.file - 1] === EMPTY) {
            return new Coordinates(destination.file, 7);
        }

        return new Coordinates(destination.file, 6);
    }

    return;
}

const _notation_to_coordinates = (notation) => {
    
    const alpha_file = notation.slice(0, 1);

    const file = FILES.indexOf(alpha_file) + 1;

    const rank = notation.slice(1);

    return new Coordinates(file, rank);
}

const _file_to_number = (file) => {
    return FILES.indexOf(file) + 1;
}

/* 
    Courtesy of:
        https://stackoverflow.com/questions/3277369/how-to-simulate-a-click-by-using-x-y-coordinates-in-javascript
*/
const _click_pixel = (x, y) => {
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });

    var el = document.elementFromPoint(x, y);

    // Add a square to where the click was made
    el.classList.add('square-clicked');

    el.dispatchEvent(ev);
}

/*
    var rect = document.getElementById('board-play-computer').getBoundingClientRect();
    console.log(rect.top, rect.right, rect.bottom, rect.left);
*/


/*
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

*/


export {
    create_full_pgn,
    parse_move,
    make_move
}
