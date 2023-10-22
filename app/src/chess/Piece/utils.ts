import {
    PieceType
} from '../types';

export const piece_type_to_name = (type: PieceType): string => {
    switch (type) {
        case PieceType.King:
            return 'King';
        case PieceType.Queen:
            return 'Queen';
        case PieceType.Rook:
            return 'Rook';
        case PieceType.Bishop:
            return 'Bishop';
        case PieceType.Knight:
            return 'Knight';
        case PieceType.Pawn:
            return 'Pawn';
        default:
            return '';
    }
}