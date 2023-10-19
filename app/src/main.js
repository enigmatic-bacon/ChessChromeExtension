'use strict';
    
import { Piece } from './chess/index';
import { await_page_load } from './scripts/load_script';
import {
    inject_dashboard,
    add_container_movement
} from './scripts/control_script';

const main = async () => {

    await inject_dashboard();
    await add_container_movement();

    const king = document.getElementsByClassName('wk')[0]
    const piece = new Piece(king);
    console.log(piece);


};

await_page_load().then(main);