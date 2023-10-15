
const WHITE = 'w';
const BLACK = 'b';
const EMPTY = '';

const CAPTURE_INDICATOR = 'x';

const CASTLE_INDICATOR = 'o';
const SHORT_CASTLE = 'oo';
const LONG_CASTLE = 'ooo';

const PIECE_TYPES = ['p', 'n', 'b', 'r', 'q', 'k'];
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

    move_text = move_text.trim().toLowerCase();

    if (move_text.length === 0) { return; }
    
    /* Check for castling (starts with 'O') */
    if (move_text.slice(0, 1) === CASTLE_INDICATOR) {
        
        /* Remove possible dashes */
        move_text = move_text.split('-').join('');

        return _create_castle_move(move_text, player_color);
    }

    /* Check for pawn move (starts with file) */
    if (FILES.includes(move_text.slice(0, 1))) {
        return _create_pawn_move(board, move_text, player_color);
    }


    /* Continue logic for non-castling moves */


    return;
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

const _create_pawn_move = (board, move_text, player_color) => {
    /* Determine if the pawn is capturing */
    const is_capture = move_text.slice(1, 2) === CAPTURE_INDICATOR;

    const text_destination = is_capture ? move_text.slice(2) : move_text;

    const destination = _notation_to_coordinates(text_destination);

    if (is_capture) {

        const origin_file = FILES.indexOf(move_text.slice(0, 1)) + 1;

        const origin = new Coordinates(
            origin_file,
            player_color === WHITE ? destination.rank - 1 : destination.rank + 1
        );

        return new Move(origin, destination, true);
    }

    if ( (player_color === WHITE && destination.rank === 4) ||
         (player_color === BLACK && destination.rank === 5)) {
        const origin = _resolve_pawn_double_move(
            board,
            destination,
            player_color
        );

        return new Move(origin, destination, false);
    }

    const origin = new Coordinates(
        destination.file,
        player_color === WHITE ? destination.rank - 1 : destination.rank + 1
    );

    return new Move(origin, destination, false);
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


export {
    create_full_pgn,
    parse_move
}
