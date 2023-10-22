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

export class Square implements ISquare {
    location: Coordinate;
    piece: Nullable<Piece>;

    constructor(coord: Coordinate) {
        this.location = coord;
        this.piece = null;
    }

    public is_empty(): boolean {
        return !this.piece;
    }

    public is_attacked_by(color: ColorType): boolean {
        return false;
    }
}