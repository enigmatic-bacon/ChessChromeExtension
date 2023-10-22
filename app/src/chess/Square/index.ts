import {
    ISquare,
    Nullable,
    ColorType
} from '../types';

import {
    Piece
} from '../Piece/index';

import {
    Coordinate
} from '../Coordinate/index'

/*
 * Stores relevant information
 * about a square on the board.
 */
export class Square implements ISquare {
    location: Coordinate;
    piece: Nullable<Piece>;

    constructor(coord: Coordinate) {
        this.location = coord;
        this.piece = null;
    }

    /*
     * Returns whether or not
     * the square is empty.
     * 
     * @returns {boolean}
     */
    public is_empty(): boolean {
        return !this.piece;
    }

    /*
     * TODO: Implement attack logic. This may
     *       be better suited for the board.
     *
     * Returns whether or not
     * the square is attacked by
     * the specified color.
     * 
     * @param {ColorType} color - The color to check.
     * @returns {boolean}
     */
    public is_attacked_by(color: ColorType): boolean {
        return false;
    }
}