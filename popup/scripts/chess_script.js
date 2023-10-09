/* PRELOAD */

var isDown = false;   // Tracks status of mouse button

const SLEEP_INTERVAL = 1000; // One second

/* Sleep for a given number of milliseconds */
const sleep = ms => new Promise(r => setTimeout(r, ms));

const await_page_load = async () => {
    /*
        Wait until the 'username' text appears on the page
        before moving into the main function.
    */
    while (document.getElementsByClassName('user-username-component').length === 0) {
        // console.log('Waiting for page to load');
        await sleep(SLEEP_INTERVAL);
    }
};

/* END PRELOAD */

const resolve_piece_type = (piece_html) => {
    
    const piece_class = String(piece_html.className);
    /* Contains (b/w)(piece type) */
    const piece_type_info = piece_class.split(' ')[1].split('');

    /* Return uppercase piece type if white, lowercase if black */
    return piece_type_info[0] === 'w' ? piece_type_info[1].toUpperCase() : piece_type_info[1].toLowerCase();
}

const get_piece_coordinates = (piece_html) => String(piece_html.className).slice(-2).split('').reverse()

/* Build the board state from the html fragments */
const build_board = (pieces) => {
    
    const board = Array(8).fill().map(_ => Array(8).fill(0))

    for(let i = 0; i < pieces.length; i++) {
        try {
            const piece = pieces[i];
            const coords = get_piece_coordinates(piece);
            const piece_type = resolve_piece_type(piece);

            board[coords[0] - 1][coords[1] - 1] = piece_type;
        } catch (e) {
            continue;
        }
    }

    /* Reverse the board so that it is in the black-orientation */
    return board.reverse();
}

/* Build the PGN string from the board state given as html fragments */
const build_PGN = (pieces, last_move_pair) => {

    const board = build_board(pieces);

    var PGN = '';

    for(let i = 0; i < board.length; i++) {
        const row = board[i];

        for(let j = 0; j < row.length; j++) {
            // Replace white-spaces with the number
            // of consecutive white-spaces before the piece
            if(row[j] === 0) {
                let count = 0;
                while(row[j + count] === 0) {
                    count++;
                }

                PGN += count;
                j += count - 1;
                continue;
            }

            PGN += row[j];
        }

        PGN += '/';
    }

    PGN = PGN.slice(0, -1);

    // PGN += ' ' + get_turn(pieces, last_move_pair);

    return PGN;
}

/* Return 'b' if black is to move next, 'w' if white is to move next */
const get_turn = (pieces, last_move_pair) => {
    const last_move_coords = [];
    
    for(let i = 0; i < last_move_pair.length; i++) {
        const last_move = last_move_pair[i];
        last_move_coords.push(get_piece_coordinates(last_move));
    }

    for(let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        const coords = get_piece_coordinates(piece);

        if(coords[0] === last_move_coords[0][0] && coords[1] === last_move_coords[0][1]) {
            return String(piece.className).split(' ')[1][0] == 'b' ? 'w' : 'b';
        }
    }

    return 'b';
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

    /*
        Sort the pieces by their cooridinates such that 
        we move (a1 -> h8, left to right, bottom to top)
    */
    pieces.sort((a, b) => {
        return String(b.className).slice(-2).split('').reverse().join('') - 
               String(a.className).slice(-2).split('').reverse().join('');
    });

    const PGN = build_PGN(pieces, last_move_pair);

    return PGN;
};


const create_controls_objects = (controls_container) => {

    controls_container.addEventListener('mousedown', () => {
        isDown = true;
    }, true);

    document.addEventListener('mouseup', () => {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', (e) => {
        e.preventDefault();

        if (isDown) {
            var deltaX = e.clientX;
            var deltaY = e.clientY;
            var rect = controls_container.getBoundingClientRect();
            controls_container.style.left = deltaX - rect.width + 'px';
            controls_container.style.top  = deltaY - rect.height + 'px';
        }

     }, true);
    
    controls_container.innerHTML = `
        <button id="controls-get-pgn" style="color: red">[Get PGN]</button>
        <h4 id='controls-pgn-result'></h4>
    `;

    return controls_container;
}

const style_controls = (controls_container) => {
    controls_container.style.position = 'absolute';
    controls_container.style.backgroundColor = 'black';
    controls_container.style.padding = '1rem';
    controls_container.style.width = '50%';
    controls_container.style.color = 'red';

    return controls_container;
}



const build_controls = () => {
    let msg = new SpeechSynthesisUtterance();

    let controls_container = document.createElement('div');

    controls_container.id = 'voice-controls-container';

    controls_container = create_controls_objects(controls_container);
    
    controls_container = style_controls(controls_container);

    

    document.getElementById('board-layout-main').appendChild(controls_container);

    document.getElementById('controls-get-pgn').addEventListener('click', async () => {
        msg.text = await main().then(PGN => PGN);
        document.getElementById('controls-pgn-result').innerHTML = msg.text;

        window.speechSynthesis.speak(msg);
    });
}

/* 
    Once the 'download' button appears, the board is no 
    longer in the default state and we can begin parsing.

    This is a bit of a hack, but it works, and took forever to figure out
    since the board initially flashes in the default state before loading
*/

await_page_load().then(build_controls).then(main);
