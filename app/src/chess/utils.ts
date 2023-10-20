import { ColorType, PieceType } from "./types";
import { Piece } from './index';

export const file_to_index = (file: string): number => {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
}

export const invert_color = (color: ColorType): ColorType => {
    return color === ColorType.White ? ColorType.Black : ColorType.White;
}

export const find_pieces = (pieces: Piece[], color: ColorType, type: PieceType): Piece[] => {
    return pieces.filter((piece: Piece) => {
        return piece.color === color && piece.type === type;
    });
}

export const remove_piece = (pieces: Piece[], piece: Piece): Piece[] => {
    return pieces.filter((p: Piece) => {
        return p.location.rank !== piece.location.rank || p.location.file !== piece.location.file;
    });
}