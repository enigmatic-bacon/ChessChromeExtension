'use strict';
    
import {
    ChessBoard
} from './chess/Board/index';

import {
    MoveFactory,
} from './chess/Move/index';

import {
    await_page_load
} from './scripts/load_script';

import {
    inject_dashboard,
    get_move_from_form
} from './scripts/control_script';

const main = async () => {

    await inject_dashboard();

    const board = new ChessBoard();

    console.log(board);

    document.getElementById('controls-move-form').addEventListener('submit', e => {
        e.preventDefault();

        const move_text = get_move_from_form();

        let parsed_move;
        
        try {
            parsed_move = MoveFactory.build_from_string(board, move_text, board.player_color);
        } catch (err) {
            console.log(err.message);
            console.log(board);
            return;
        }

        board.make_move(parsed_move);
    });
};

await_page_load().then(main);