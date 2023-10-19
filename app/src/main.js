'use strict';
    
import { Piece } from './chess/index';
import { await_page_load } from './scripts/load_script';
import { inject_dashboard } from './scripts/control_script';

const main = async () => {

    await inject_dashboard();

    const king = document.getElementsByClassName('wk')[0]
    const piece = new Piece(king);
    console.log(piece);

    
};

await_page_load().then(main);