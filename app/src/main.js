'use strict';
    
import { Piece } from './chess/index';

const king = document.getElementsByClassName('wk')[0]

const piece = new Piece(king);

console.log(piece);