import {
    Piece
} from '../Piece/index';

import {
    ColorType,
    PieceType
} from '../types'

export const find_pieces = (pieces: Piece[], color: ColorType, type: PieceType): Piece[] => {
    return pieces.filter((piece: Piece) => {
        return piece.color === color && piece.type === type;
    });
}