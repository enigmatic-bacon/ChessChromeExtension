import {
    Constants,
    ErrorHelper
} from '../../constants';

import {
    IMove,
    IMoveFactory,
    PieceType,
} from '../types';

import {
    Coordinate,
    CoordinateFactory
} from '../Coordinate/index';

import {
    Piece
} from '../Piece/index';

import {
    ChessBoard
} from '../Board/index';

import {
    find_pieces
} from './utils';

export class MoveFactory implements IMoveFactory {

    public static build_from_string(board: ChessBoard,  move: string): Move {
        if (!move.length) { return; }

        /* 
         * Mess with the logic a little because 'b' is a valid file,
         * and 'B' is a valid piece type, so if we lowercase the move 
         * text then we can't tell if it's a file or a piece type.
         */
        const is_pawn_move: boolean = Constants.FILES.includes(move.slice(0, 1));

        if (is_pawn_move) {
            return this._create_pawn_move(board, move);
        }

        move = move.trim().toLowerCase();

        if (move.slice(0, 1) === Constants.CASTLE_INDICATOR) {
            return this._create_castle_move(board, move);
        }

        const piece_type: PieceType = move.slice(0, 1) as PieceType;

        const possible_pieces: Piece[] = find_pieces(board.pieces, board.player_color, piece_type);

        if (!possible_pieces.length) { return; }

        const destination_text: string = move.slice(1, 2) === Constants.CAPTURE_INDICATOR ?
                                         move.slice(2) : move.slice(1);

        const destination: Coordinate = CoordinateFactory.build_from_string(destination_text);

        let move_piece: Piece;

        possible_pieces.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                if (move_piece) {
                    ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.AMBIGUOUS_MOVE);
                }

                move_piece = piece;
            }
        });

        if (!move_piece) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_MOVE);
        }

        return new Move(move_piece.location, destination);
    }

    public static build_from_coords(from: Coordinate, to: Coordinate): Move {
        return new Move(from, to);
    }

    private static _create_pawn_move(board: ChessBoard, move: string): Move {
        const possible_pawns: Piece[] = find_pieces(
            board.pieces,
            board.player_color,
            PieceType.Pawn
        );

        if(!possible_pawns.length) { return; }

        let destination: Coordinate;

        if (move.length === 2) {
            destination = CoordinateFactory.build_from_string(move);
        } else {
            if (move.slice(1,2) === Constants.CAPTURE_INDICATOR) {
                destination = CoordinateFactory.build_from_string(move.slice(2));
            } else {
                destination = CoordinateFactory.build_from_string(move.slice(1));
            }
        }

        let pawn: Piece;

        possible_pawns.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                if (pawn) {
                    ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.AMBIGUOUS_MOVE);
                }

                pawn = piece;
            }
        });

        if (!pawn) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_MOVE);
        }

        return new Move(pawn.location, destination);
    }

    private static _create_castle_move(board: ChessBoard, castle_text: string): Move {
        return;
    }
}


export class Move implements IMove {
    from: Coordinate;
    to: Coordinate;

    constructor(from: Coordinate, to: Coordinate) {
        this.from = from;
        this.to = to;
    }

    equals (move: Move): boolean {
        return this.from.rank === move.from.rank &&
               this.from.file === move.from.file &&
               this.to.rank === move.to.rank &&
               this.to.file === move.to.file;
    }
}