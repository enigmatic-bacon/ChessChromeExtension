
const WHITE = 'w';
const BLACK = 'b';
const EMPTY = '';

class Coordinates {
    constructor (file, rank) {
        this.file = file;
        this.rank = rank;
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

const build_board = (pieces) => {

    const board = Array(8).fill().map(() => Array(8).fill(''));

    pieces.forEach(piece_html => {
        const piece = new Piece(piece_html);

        board[piece.coordinates.rank - 1][piece.coordinates.file - 1] = piece;
    });

    return board;
}

const get_pgn = (board) => {

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



const main = async () => {
    
    const board_element = document.getElementById('board-single') ? 
                          document.getElementById('board-single') : 
                          document.getElementById('board-play-computer');

    /* Select all pieces on the board */
    const pieces = Array.from(board_element.children).filter(
        child => String(child.className).startsWith('piece')
    );

    const last_move_pair = Array.from(board_element.children).filter(
        child => String(child.className).startsWith('highlight')
    );

    const board = build_board(pieces);

    const current_turn = get_turn(board, last_move_pair);
    
    const PGN = get_pgn(board) + ' ' + current_turn;

    document.getElementById('controls-get-pgn').addEventListener('click', async () => {
        const msg = new SpeechSynthesisUtterance();
        msg.text = PGN;
        document.getElementById('controls-pgn-result').innerHTML = msg.text;

        // window.speechSynthesis.speak(msg);
    });

    return PGN;
};







/* 
    Once the 'download' button appears, the board is no 
    longer in the default state and we can begin parsing.

    This is a bit of a hack, but it works, and took forever to figure out
    since the board initially flashes in the default state before loading
*/

// await_page_load().then(build_controls).then(main);

export {
    main
}
