'use strict';
    
import { ChessBoard } from './chess/index';
import { await_page_load } from './scripts/load_script';
import {
    inject_dashboard
} from './scripts/control_script';

const main = async () => {

    await inject_dashboard();

    const board = new ChessBoard();

    console.log(board);
};

await_page_load().then(main);