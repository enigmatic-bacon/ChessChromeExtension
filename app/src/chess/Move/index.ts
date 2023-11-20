import {
    Constants,
    ErrorHelper,
    MoveSpeaker
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

import {
    file_to_index
} from '../Coordinate/utils';

export class MoveFactory implements IMoveFactory {
    /*
     * Given a user move string, return a Move object.
     * 
     *        Examples:
     *          - 'e4' -> Pawn either e2 or e3 to e4
     *          - 'Nf3' -> Knight to f3
     *          - 'Nxf3' -> Knight to f3, capturing
     *          - 'Rdd3' -> Rook on d-file to f3
     *          - 'R1f3' -> Rook on first rank to f3
     *          - 'R1xf3' -> Rook on first rank to f3, capturing
     *          - 'O-O' -> King side castle (OO, oo)
     *          - 'O-O-O' -> Queen side castle
     *          - 'e8=Q' -> Pawn on e-file to e8, promoting to queen
     *          - 'Qd3xf3' -> Queen on d3 to f3, capturing
     *          - 'Be2+' -> Bishop on e2 to e3, checking
     *          - 'Bxe2+' -> Bishop on e2 to e3, capturing and checking
     *          - 'Bxe2#' -> Bishop on e2 to e3, capturing and checkmate
     * 
     * @param {ChessBoard} board - The current board state.
     * @param {string} move - The user's move string.
     * @returns {Move} - The move object.
     */
    public static build_from_string(board: ChessBoard,  move: string): Move {
        if (!move.length) { return; }

        board.update_board_before_move();

        /* Determine if the move is a castle move. */
        if (move.slice(0, 1).toLowerCase() === Constants.CASTLE_INDICATOR) {
            return this._create_castle_move(board, move);
        }

        /* Normalize the move text */
        move = move.trim().replace(/[x#+]/g, '');
        if (move.length > 5) { return; }
        
        /* 
         * Mess with the logic a little because 'b' is a valid file,
         * and 'B' is a valid piece type, so if we lowercase the move 
         * text then we can't tell if it's a file or a piece type.
         */
        const is_pawn_move: boolean = Constants.FILES.includes(move.slice(0, 1).toLowerCase()) &&
                                      move.slice(0,1).toLowerCase() == move.slice(0,1);


        move = move.toLowerCase();

        /* Handle all other moves the same */
        const piece_type: PieceType = is_pawn_move ? 
        PieceType.Pawn : move.slice(0, 1) as PieceType;

        /* Possible promotion */
        let promotion_piece: PieceType = null;
        if (is_pawn_move && move.includes('=')){
            const num_eq = move.split('=').length - 1;
            let rank;
            if (move.length === 5){
              rank = parseInt(move.slice(2, 3)) - 1;
            }
            else {
              rank = parseInt(move.slice(1, 2)) - 1;
            }
            
            /* Can't have more than one equal sign */
            if (num_eq > 1 || rank != 7){
                // throw error
                ErrorHelper.throw_error(
                    ErrorHelper.E_ERROR,
                    ErrorHelper.INVALID_MOVE,
                    board.speak_moves
                );
            }

            // check if valid promotion
            const eq_index = move.indexOf('=');
            if (eq_index >= move.length){ // no promotion piece specified
                ErrorHelper.throw_error(
                    ErrorHelper.E_ERROR,
                    ErrorHelper.INVALID_PROMOTION,
                    board.speak_moves
                );
            }

            // If unknown character promotion or promotion to pawn
            if (!Constants.PIECE_TYPES.includes(move.charAt(eq_index + 1)) || move.charAt(eq_index + 1) == Constants.PIECE_TYPES.at(0) || move.charAt(eq_index + 1) == Constants.PIECE_TYPES.at(5)){
                ErrorHelper.throw_error(
                    ErrorHelper.E_ERROR,
                    ErrorHelper.INVALID_PROMOTION,
                    board.speak_moves
                );
            }
            promotion_piece = move.charAt(eq_index + 1) as PieceType;
            move = move.slice(0, -2);
        }

        if (is_pawn_move) return this._create_pawn_move(board, move, promotion_piece);
        
        const possible_pieces: Piece[] = find_pieces(board.pieces, board.player_color, piece_type);

        /* Exit early if there are no pieces of the given type. */
        if (!possible_pieces.length) { return; }

        let filtered_pieces: Piece[] = possible_pieces;
        // if row or file is specified
        if (move.length === 4){
            const is_file: boolean = Constants.FILES.includes(move.slice(1, 2));
            if (is_file){
                filtered_pieces = possible_pieces.filter(piece => {
                    return piece.location.file === file_to_index(move.slice(1, 2));
                });
            } else {
                filtered_pieces = possible_pieces.filter(piece => {
                    return piece.location.rank === parseInt(move.slice(1, 2)) - 1;
                });
            }
        } // if ra and file is specified
        if (move.length === 5){
            // find piece at rank and file
            filtered_pieces = possible_pieces.filter(piece => {
                    return piece.location.file === file_to_index(move.slice(1, 2)) && 
                           piece.location.rank === parseInt(     move.slice(2, 3)) - 1;
            });
        }
        const destination_text: string = move.slice(-2);
        const destination: Coordinate = CoordinateFactory.build_from_string(destination_text);
        let move_piece: Piece;
        // huh
        /* Iterate over all possible pieces and find the one that can move to the destination. */
        filtered_pieces.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                if (move_piece) {
                    ErrorHelper.throw_error(
                        ErrorHelper.E_ERROR,
                        ErrorHelper.AMBIGUOUS_MOVE,
                        board.speak_moves
                    );
                }

                move_piece = piece;
            }
        });

        /*
         * If no piece can move to the destination,
         * then the move is invalid.
         */
        if (!move_piece) {
            ErrorHelper.throw_error(
                ErrorHelper.E_ERROR,
                ErrorHelper.INVALID_MOVE,
                board.speak_moves
            );
        }

        return new Move(move_piece.location, destination, promotion_piece);
    }

    /*
     * Given a from and to coordinate, return a Move object.
     * 
     * @param {Coordinate} from - The from coordinate.
     * @param {Coordinate} to - The to coordinate.
     * @returns {Move} - The move object.
     */
    public static build_from_coords(from: Coordinate, to: Coordinate): Move {
        return new Move(from, to, null);
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
    private static _create_pawn_move(board: ChessBoard, move: string, promo: PieceType): Move {
        console.log("player color : ", board.player_color);
        // const possible_pawns: Piece[] = find_pieces(
        //     board.pieces,
        //     board.player_color,
        //     PieceType.Pawn
        // );
        // grab possible pawns from board instead of piece array
        const possible_pawns: Piece[] = board.board.flatMap(row => row.filter(square => square.piece && square.piece.color === board.player_color && square.piece.type === PieceType.Pawn).map(square => square.piece));
        console.log(board);

        if(!possible_pawns.length) { return; }

        let destination_text = move.slice(-2);
        let destination: Coordinate = CoordinateFactory.build_from_string(destination_text);
        console.log("coords for destination: ", destination);
        
        let filtered_pawns: Piece[] = possible_pawns;
        if (move.length === 3){ // if we specify the file of a pawn
          const is_file: boolean = Constants.FILES.includes(move.slice(0, 1));
            if (is_file){
                filtered_pawns = possible_pawns.filter(piece => {
                    return piece.location.file === file_to_index(move.slice(0, 1));
                });
            } else { // should throw an error
                console.log("shouldn't be possible");
              ErrorHelper.throw_error(
                ErrorHelper.E_ERROR,
                ErrorHelper.INVALID_MOVE,
                board.speak_moves
              );
            }
          
        }

        let pawn: Piece;
        filtered_pawns.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                if (pawn) {
                    ErrorHelper.throw_error(
                        ErrorHelper.E_ERROR,
                        ErrorHelper.AMBIGUOUS_MOVE,
                        board.speak_moves
                    );
                }
                pawn = piece;
                console.log("pawn:", pawn);
            }
        });

        // console.log("filtered pawns:", filtered_pawns);
        if (!pawn) {
            console.log("no piece can move to specified destination");
            ErrorHelper.throw_error(
                ErrorHelper.E_ERROR,
                ErrorHelper.INVALID_MOVE,
                board.speak_moves
            );
        }
        console.log("chosen pawn - file:", pawn.location.file, " rank:", pawn.location.rank);
        return new Move(pawn.location, destination, promo);
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
        castle_text = castle_text.split('-').join('');

        if (castle_text.charAt(castle_text.length - 1) === '?') {
            /* 
             * First try short, if
             * (1) piece in the way -> try long
             * (2) square attacked -> try long
             * (3) works -> try long
             * 
             * Then try long, if
             * (1) piece in the way -> throw invalid
             * (2) square attacked -> throw invalid
             * (3) works, but short doesn't -> return long
             * (4) works, and short works -> throw ambiguous
             */

            const first_short_coord: Coordinate = new Coordinate(0, 5);
            const second_short_coord: Coordinate = new Coordinate(0, 6);
            
            const first_long_coord: Coordinate = new Coordinate(0, 3);
            const second_long_coord: Coordinate = new Coordinate(0, 2);

            /* Try short */
            let can_castle_short: boolean = 
                board.get_square_by_coord(first_short_coord).is_empty() &&
                board.get_square_by_coord(second_short_coord).is_empty() &&
                !board.square_is_attacked(first_short_coord) &&
                !board.square_is_attacked(second_short_coord);

            /* Try long */
            let can_castle_long: boolean = 
                board.get_square_by_coord(first_long_coord).is_empty() && 
                board.get_square_by_coord(second_long_coord).is_empty() &&
                !board.square_is_attacked(first_long_coord) &&
                !board.square_is_attacked(second_long_coord);

            if (can_castle_short && can_castle_long) {
                ErrorHelper.throw_error(
                    ErrorHelper.E_ERROR,
                    ErrorHelper.AMBIGUOUS_MOVE,
                    board.speak_moves
                );
            }

            if (!can_castle_short && !can_castle_long) {
                ErrorHelper.throw_error(
                    ErrorHelper.E_ERROR,
                    ErrorHelper.INVALID_MOVE,
                    board.speak_moves
                );
            }

            if (can_castle_short) {
                return MoveFactory.build_from_coords(
                    new Coordinate(0, 4),
                    new Coordinate(0, 6)
                )
            }

            return MoveFactory.build_from_coords(
                new Coordinate(0, 4),
                new Coordinate(0, 2)
            )
        }
        
        /* Long castle */
        if (castle_text.length === 3) {
            return MoveFactory.build_from_coords(
                new Coordinate(0, 4),
                new Coordinate(0, 2)
            )
        }


        return MoveFactory.build_from_coords(
            new Coordinate(0, 4),
            new Coordinate(0, 6)
        )
    }
}


export class Move implements IMove {
    from: Coordinate;
    to: Coordinate;
    promotion: PieceType;

    constructor(from: Coordinate, to: Coordinate, promo: PieceType) {
        this.from = from;
        this.to = to;
        this.promotion = promo;
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