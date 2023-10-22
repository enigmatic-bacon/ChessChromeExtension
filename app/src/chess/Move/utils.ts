import {
    Piece
} from '../Piece/index';

import {
    ColorType,
    PieceType
} from '../types'

/*
 * Returns a copy of the pieces array with
 * with only the pieces of the specified color
 * and type.
 * 
 * @param pieces: Piece[]
 * @param color: ColorType
 * @param type: PieceType
 * @return Piece[]
 */
export const find_pieces = (pieces: Piece[], color: ColorType, type: PieceType): Piece[] => {
    return pieces.filter((piece: Piece) => {
        return piece.color === color && piece.type === type;
    });
}

