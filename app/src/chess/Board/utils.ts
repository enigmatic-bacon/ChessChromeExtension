import {
    ColorType,
} from "../types";

import {
    Piece
} from '../Piece/index';

import {
    Nullable
} from "../types";

export const invert_color = (color: ColorType): ColorType => {
    return color === ColorType.White ? ColorType.Black : ColorType.White;
}

export const get_piece_index = (pieces: Piece[], piece: Piece): Nullable<number> => {
    const indx: Nullable<number> = pieces.findIndex((p: Piece) => {
        return p === piece;
    });

    if(indx) return indx;

    return null;
}

export const get_pieces_of_color = (pieces: Piece[], color: ColorType): Piece[] => {
    return pieces.filter((piece: Piece) => {
        return piece.color === color;
    });
}