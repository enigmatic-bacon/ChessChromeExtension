
import {
    IPiece,
    PieceType,
    ColorType
} from '../types';

import {
    Coordinate,
    CoordinateFactory
} from '../Coordinate/index';

import {
    piece_type_to_name
} from './utils';
export class Piece implements IPiece {
    location: Coordinate;
    color: ColorType;
    type: PieceType;

    /*
     * TODO: Potentially modify the constructor to
     *       a PieceFactory class.
     *
     * Reads the classList of an HTMLElement and
     * constructs a Piece object from it.
     * 
     * Note: We cannot rely on the order of the
     * classList, so we must check each class
     * individually. (Thank you Chess.com)
     * 
     * @param {HTMLElement} element - The element to read.
     * @returns {Piece} - The piece object.
     */
    constructor(element: HTMLElement) {
        element.classList.forEach(className => {
            if (className.startsWith('piece')) { return; }

            else if (className.startsWith('square')) {
                this.location = CoordinateFactory.build_from_class(className);
                return;
            } else {
                this.type = className.slice(1).toLowerCase() as PieceType;
                this.color = className.slice(0, 1) as ColorType;
            }
        });
    }

    /* 
     * Return a text-reader friendly version 
     * representation of the piece object. For
     * most pieces, this is just the type.
     */
    public to_speech (): string {
        return `${piece_type_to_name(this.type)}`;
    }

    equals (piece: Piece): boolean {
        return this.location.rank === piece.location.rank &&
               this.location.file === piece.location.file &&
               this.color === piece.color &&
               this.type === piece.type;
    }

    toString (): string {
        return `${this.color}${this.type} ${this.location.toString()}`;
    }
}