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
    /*
     * Given a user move string, return a Move object.
     * 
     * @param {ChessBoard} board - The current board state.
     * @param {string} move - The user's move string.
     * @returns {Move} - The move object.
     */
    public static build_from_string(board: ChessBoard,  move: string): Move {
        if (!move.length) { return; }

        /* 
         * Mess with the logic a little because 'b' is a valid file,
         * and 'B' is a valid piece type, so if we lowercase the move 
         * text then we can't tell if it's a file or a piece type.
         */
        const is_pawn_move: boolean = Constants.FILES.includes(move.slice(0, 1));

        if (is_pawn_move) { return this._create_pawn_move(board, move); }

        /* Normalize the move text */
        move = move.trim().toLowerCase();

        /* Determine if the move is a castle move. */
        if (move.slice(0, 1) === Constants.CASTLE_INDICATOR) {
            return this._create_castle_move(board, move);
        }

        /* Handle all other moves the same */
        const piece_type: PieceType = move.slice(0, 1) as PieceType;

        const possible_pieces: Piece[] = find_pieces(board.pieces, board.player_color, piece_type);

        /* Exit early if there are no pieces of the given type. */
        if (!possible_pieces.length) { return; }

        /*
         * Determine where the piece is moving to.
         * This is a little hacky because we do not
         * want users who do not enter a capture indicator
         * to have their moves rejected.
         */
        const destination_text: string = move.slice(1, 2) === Constants.CAPTURE_INDICATOR ?
                                         move.slice(2) : move.slice(1);

        const destination: Coordinate = CoordinateFactory.build_from_string(destination_text);

        let move_piece: Piece;

        /* Iterate over all possible pieces and find the one that can move to the destination. */
        possible_pieces.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                /* 
                 * TODO: Handle resolve ambiguity.
                 * 
                 * If a previous piece can move
                 * to the destination, then the move 
                 * is ambiguous.
                 */
                if (move_piece) {
                    ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.AMBIGUOUS_MOVE);
                }

                move_piece = piece;
            }
        });

        /*
         * If no piece can move to the destination,
         * then the move is invalid.
         */
        if (!move_piece) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_MOVE);
        }

        return new Move(move_piece.location, destination);
    }

    /*
     * Given a from and to coordinate, return a Move object.
     * 
     * @param {Coordinate} from - The from coordinate.
     * @param {Coordinate} to - The to coordinate.
     * @returns {Move} - The move object.
     */
    public static build_from_coords(from: Coordinate, to: Coordinate): Move {
        return new Move(from, to);
    }

    /*
     * Given the state of the board and
     * a potential pawn move, return a Move object.
     * We handle this logic separately because
     * pawn moves are a little different than
     * other moves.
     * 
     * @param {ChessBoard} board - The current board state.
     * @param {string} move - The user's move string.
     * @returns {Move} - The move object.
     */
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

    /*
     * TODO: Implement castle moves.
     *
     * Given the state of the board and
     * a potential castle move, return a Move object.
     * We handle this logic separately because
     * castle moves are also different from
     * how a king can normally move.
     * 
     * @param {ChessBoard} board - The current board state.
     * @param {string} move - The user's move string.
     * @returns {Move} - The move object.
     */
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

    /* 
     * Return a text-reader friendly version 
     * representation of the move object. For
     * most moves, this is just the destination.
     */
    public to_speech (): string {
        return `${this.to.to_speech()}`;
    }

    equals (move: Move): boolean {
        return this.from.rank === move.from.rank &&
               this.from.file === move.from.file &&
               this.to.rank === move.to.rank &&
               this.to.file === move.to.file;
    }
}