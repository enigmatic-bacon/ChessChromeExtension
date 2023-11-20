import {
    Constants,
    MoveSpeaker,
    ErrorHelper
} from '../../constants';

import {
    IChessBoard,
    ColorType,
    PieceType,
} from '../types';

import {
    Square
} from '../Square/index';

import {
    Piece
} from '../Piece/index';

import {
    CoordinateFactory,
    Coordinate
} from '../Coordinate/index';

import {
    Move
} from '../Move/index';

import {
    invert_color,
    get_pieces_of_color
} from './utils';


export class ChessBoard implements IChessBoard {
    board_element: HTMLElement;
    board: Square[][];
    turn: ColorType;
    player_color: ColorType;
    pieces: Piece[];

    speak_moves: boolean;

    private _atmoveted_move: boolean = false;

    constructor(speak_moves: boolean = false) {

        this.board_element = document.getElementById('board-single') ? 
                             document.getElementById('board-single') : 
                             document.getElementById('board-play-computer') ?
                             document.getElementById('board-play-computer') :
                             document.getElementById('board-analysis-board');

        this.player_color = this.board_element.classList.contains('flipped') ?
                            ColorType.Black : ColorType.White;
        console.log("player color in constructor", this.player_color);

        this.speak_moves = speak_moves;
        
        this._initialize_pieces_and_board();

        this._initialize_turn();

        this._initialize_observer();

        return;
    }

    /*
     * Given a piece and coordinate, determines
     * if that particular piece can physically
     * make a move to that coordinate.
     * 
     * @param piece: Piece (Piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if piece can move to coord)
     */
    public piece_can_move_to(piece: Piece, coord: Coordinate): boolean {
        switch (piece.type) {
            case PieceType.King:
                return this._king_can_move_to(piece, coord);
            case PieceType.Queen:
                return this._queen_can_move_to(piece, coord);
            case PieceType.Rook:
                return this._rook_can_move_to(piece, coord);
            case PieceType.Bishop:
                return this._bishop_can_move_to(piece, coord);
            case PieceType.Knight:
                return this._knight_can_move_to(piece, coord);
            case PieceType.Pawn:
                return this._pawn_can_move_to(piece, coord);
            default:
                return false;
        }
        // WHEN CAPTURING, WRONG PIECE IS SAID. (i.e, pawn at b6 captures bishop at a5,
        //                                                     speaker: "bishop takes b6",
        //                                                         knight at d5 captures pawn at c7,
        //                                                      speaker: "pawn takes d5")
    }

    /*
     * Relay a move to the chess.com
     * board element by simulating a
     * pointer event.
     * 
     * @param move: Move (Move to make)
     */
    public async make_move(move: Move): Promise<void> {
        console.log("move:", move.to, move.from);

        // make a copy of to and from, in order to not modify the original move/piece coords
        let from_file = move.from.file;
        let from_rank = move.from.rank;
        let to_file = move.to.file;
        let to_rank = move.to.rank;

        // if the player is black, invert the coords
        if (this.player_color === ColorType.Black){
            from_rank = Math.abs(move.from.rank - 7);
            from_file = Math.abs(move.from.file - 7);
            to_rank = Math.abs(move.to.rank - 7);
            to_file = Math.abs(move.to.file - 7);
        }

        console.log("inverted from:", from_rank, from_file);
        console.log("inverted to:", to_rank, to_file);

        // current real positions on the board as input
        const square_element: HTMLElement = this.board_element.querySelector(
            `.square-${move.from.file + 1}${move.from.rank + 1}`
        );

        const square_length: number = square_element.getBoundingClientRect().width;
        const origin_offset_x: number = this.board_element.getBoundingClientRect().x;
        const origin_offset_y: number = this.board_element.getBoundingClientRect().y;

        // if black, clientX and Y will use inverted coords
        let event = new PointerEvent('pointerdown', {
            clientX: square_length * (from_file + 0.5) + origin_offset_x,
            clientY: square_length * (Constants.BOARD_SIZE - from_rank - 0.5) + origin_offset_y,
            bubbles: true
        });

        this.board_element.dispatchEvent(event);

        event = new PointerEvent('pointerup', {
            clientX: square_length * (to_file + 0.5) + origin_offset_x,
            clientY: square_length * (Constants.BOARD_SIZE - to_rank - 0.5) + origin_offset_y,
            bubbles: true
        });

        this.board_element.dispatchEvent(event)

        this._atmoveted_move = true;

        await new Promise(
            resolve => setTimeout(
                resolve, Constants.OBSERVER_INTERVAL
            )
        );
        // scuffed for right now, just have extra flag for now so observer doesn't throw error on promotion
        if (this._atmoveted_move && !move.promotion) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_MOVE, true);
            return;
        }

        if (move.promotion){
            
            const promotion_window: HTMLElement = document.querySelector(
                '.promotion-window'
            );
            const promotion_piece: HTMLElement = promotion_window.querySelector(
                `.${this.player_color}${move.promotion}`
            );

            promotion_piece.dispatchEvent(new PointerEvent('pointerdown', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
        }

        return;
    }

    public get_pgn(): string {
        return '';
    }

    public get_square_by_coord(coord: Coordinate): Square {
        return this.board[coord.rank][coord.file];
    }

    public square_is_attacked(coord: Coordinate): boolean {
        const pieces: Piece[] = get_pieces_of_color(
            this.pieces, invert_color(this.turn)
        );

        for (let i = 0; i < pieces.length; i++) {
            if (this.piece_can_move_to(pieces[i], coord)) {
                return true;
            }
        }

        return false;
    }

    public update_board_before_move(): void {
        this._initialize_pieces_and_board();
    }

    /*
     * Updates the internal state of the board
     * class and all of its member variables.
     * Currently, it just re-reads the whole board
     * from chess.com. This is not ideal, but
     * also not a huge deal.
     */
    private _update_board_after_move(): void {
        this._atmoveted_move = false;

        /*
         * TODO: FIXME
         *
         * We don't need to re-initialize the turn
         * but this is a quick solution to relay
         * the move to the user.
         */
        this._initialize_turn();

        /* 
         * Somebody smarter than me can figure out
         * how to do this better. Currently, we
         * just re-read the whole board, but we
         * could theoretically rely on an internal
         * state instead.
         */
        this._initialize_pieces_and_board();

        return;
    }

    /*
     * Reads the current state of the board
     * and initializes the internal state of
     * the board class from a live board object.
     */
    private _initialize_pieces_and_board(): void {

        this.pieces = Array();
        this.board = Array(Constants.BOARD_SIZE).fill(null).map(() => 
            Array(Constants.BOARD_SIZE).fill(null)
        );

        this.board.forEach((row, rank) => {
            row.forEach((_, file) => {
                this.board[rank][file] = new Square(
                    CoordinateFactory.build_from_coords(rank, file)
                );
            });
        });

        const pieces_html: Element[] = Array.from(this.board_element.children).filter(
            child => String(child.className).startsWith('piece')
        );

        pieces_html.forEach(piece_html => {
            const piece: Piece = new Piece(piece_html as HTMLElement);

            this.pieces.push(piece);

            this.board[piece.location.rank][piece.location.file].piece = piece;
        });

        return;
    }

    /*
     * Initializes an observer on the board
     * which tracks a particular div whose
     * class changes when a move is made.
     */
    private _initialize_observer(): void {
        /*
         * The move indicator is the third child of
         * the board element. When we observe a class 
         * mutation, we can trigger a board update.
         */
        const first_move_indicator = this.board_element.children[2];
        const second_move_indicator = this.board_element.children[3];

        var observer = new MutationObserver( event => {
            this.turn = invert_color(this.turn);
            this._update_board_after_move();
        })

        observer.observe(first_move_indicator, {
            attributes: true,
            attributeFilter: ['class'],
        });

        observer.observe(second_move_indicator, {
            attributes: true,
            attributeFilter: ['class'],
        })
    }

    /*
     * On the first read of the board, we do not
     * know who made the last move. So, we check
     * the last move indicator to see the color
     * of the piece which last moved, and take
     * the opposite color as the current turn.
     */
    private _initialize_turn(): void {
        this.player_color = this.board_element.classList.contains('flipped') ?
        ColorType.Black : ColorType.White;
console.log("player color in initilialize turn", this.player_color);
        
        const last_move_pair: Element[] = Array.from(this.board_element.children).filter(
            child => String(child.className).startsWith('highlight')
        );

        let capture_sum: number = 0;
        let moved_piece: Piece = null;
        let moved_to: Coordinate = null;

        last_move_pair.forEach(move_html => {
            move_html.classList.forEach(className => {
                if (!className.startsWith('square')) { return; }

                const coord: Coordinate = CoordinateFactory.build_from_class(className);

                if (this.board[coord.rank][coord.file].piece) {
                    capture_sum += 1;

                    const current_piece = this.board[coord.rank][coord.file].piece;

                    if(current_piece.color === invert_color(this.turn)) {
                        moved_piece = current_piece;
                    } else if (current_piece.color === this.turn) {
                        moved_to = current_piece.location;
                    }
                } else {
                    moved_to = coord;
                }
            });
        });

        /*
         * TODO: Move this to a better place.
         * TODO: Determine move vs. capture
         *       and change message accordingly.
         *
         * We can move this from here once
         * we have a better way to relay
         * moves to the user.
         */
        if (this.speak_moves && moved_piece && moved_to) {
            const is_capture: boolean = capture_sum > 1;
            const action: string = is_capture ? ' takes ' : ' to ';
            
            MoveSpeaker.speak_message(
                moved_piece.to_speech() + 
                action +
                moved_to.to_speech()
            );
        }
            
    }

    /*
     * Returns whether or not a king piece
     * can move to a particular coordinate.
     * 
     * @param king: Piece (King piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if king can move to coord)
     */
    private _king_can_move_to(king: Piece, coord: Coordinate): boolean {
        const target_square = this.board[coord.rank][coord.file];

        /* Check if destination is not attacked by an enemy piece */
        if (target_square.is_attacked_by(invert_color(king.color))) {
            return false;
        }

        /* Check that the destination is
         * no more than one move away
         */
        const file_diff: number = Math.abs(king.location.file - coord.file);
        const rank_diff: number = Math.abs(king.location.rank - coord.rank);

        if (file_diff > 1 || rank_diff > 1) { return false; }

        /* Check if destination is not occupied by a piece of the same color */
        if (this.board[coord.rank][coord.file].is_empty() ||
            this.board[coord.rank][coord.file].piece.color !== king.color) {
            return true;
        }

        return false;
    }

    /*
     * Returns whether or not a queen piece
     * can move to a particular coordinate.
     * 
     * @param queen: Piece (Queen piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if queen can move to coord)
     */
    private _queen_can_move_to(queen: Piece, coord: Coordinate): boolean {
        /* 
         * If the queen is moving horizontally or 
         * vertically, it's a rook move.
         */
        if (queen.location.file === coord.file ||
            queen.location.rank === coord.rank) {
            return this._rook_can_move_to(queen, coord);
        }

        /* If the queen is moving diagonally
         * it's a bishop move.
         *
         * (I am pretty proud of this method).
         */
        return this._bishop_can_move_to(queen, coord);
    }

    /*
     * Returns whether or not a rook piece
     * can move to a particular coordinate.
     * 
     * @param rook: Piece (Rook piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if rook can move to coord)
     */
    private _rook_can_move_to(rook: Piece, coord: Coordinate): boolean {
        /* Quick check to see if the rook is moving diagonally, so we can return early */
        if (rook.location.file !== coord.file && rook.location.rank !== coord.rank) {
            return false;
        }

        /*
         * If the rook is moving vertically,
         * check if there are any pieces in the
         * way of the move.
         */
        if (rook.location.file === coord.file) {
            const min = Math.min(rook.location.rank, coord.rank);
            const max = Math.max(rook.location.rank, coord.rank);

            for (let i = min + 1; i < max; i++) {
                if (!this.board[i][rook.location.file].is_empty()) {
                    return false;
                }
            }
        }

        /*
         * If the rook is moving horizontally,
         * check if there are any pieces in the
         * way of the move.
         */
        else if (rook.location.rank === coord.rank) {
            const min = Math.min(rook.location.file, coord.file);
            const max = Math.max(rook.location.file, coord.file);

            for (let i = min + 1; i < max; i++) {
                if (!this.board[rook.location.rank][i].is_empty()) {
                    return false;
                }
            }
        } else { return false; }

        /* Check if destination is not occupied by a piece of the same color */
        if (this.board[coord.rank][coord.file].is_empty() ||
            this.board[coord.rank][coord.file].piece.color !== rook.color) {
            return true;
        }

        return false;
    }

    /*
     * Returns whether or not a bishop piece
     * can move to a particular coordinate.
     * 
     * @param bishop: Piece (Bishop piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if bishop can move to coord)
     */
    private _bishop_can_move_to(bishop: Piece, coord: Coordinate): boolean {
        
        const file_diff: number = Math.abs(bishop.location.file - coord.file);
        const rank_diff: number = Math.abs(bishop.location.rank - coord.rank);

        if (file_diff !== rank_diff) { return false; }

        const file_direction: number = bishop.location.file < coord.file ? 1 : -1;
        const rank_direction: number = bishop.location.rank < coord.rank ? 1 : -1;

        for (let i = 1; i < file_diff; i++) {
            const check_rank: number = bishop.location.rank + rank_direction * i;
            const check_file: number = bishop.location.file + file_direction * i;

            if (!this.board[check_rank][check_file].is_empty()) {
                return false;
            }
        }

        /* Check if destination is not occupied by a piece of the same color */
        if (this.board[coord.rank][coord.file].is_empty() ||
            this.board[coord.rank][coord.file].piece.color !== bishop.color) {
            return true;
        }

        return false;
    }

    /*
     * Returns whether or not a knight piece
     * can move to a particular coordinate.
     * 
     * @param knight: Piece (Knight piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if knight can move to coord)
     */
    private _knight_can_move_to(knight: Piece, coord: Coordinate): boolean {
        const file_diff: number = Math.abs(knight.location.file - coord.file);
        const rank_diff: number = Math.abs(knight.location.rank - coord.rank);

        /* Check if destination is not occupied by a piece of the same color */
        if (!this.board[coord.rank][coord.file].is_empty() &&
            this.board[coord.rank][coord.file].piece.color === knight.color) {
            return false;
        }

        if (file_diff === 2 && rank_diff === 1) { return true; }
        if (file_diff === 1 && rank_diff === 2) { return true; }

        return false;
    }

    /*
     * Returns whether or not a pawn piece
     * can move to a particular coordinate.
     * 
     * Special Considerations:
     * 
     *  - Pawns can only move diagonally if
     *          they are capturing a piece.
     *  - Pawns can only move forward two spaces if 
     *          they are on their starting rank.
     *  - Pawns can perform en passant.
     * 
     * @param pawn: Piece (Pawn piece to move)
     * @param coord: Coordinate (Coordinate to move to)
     * @return {boolean} (True if pawn can move to coord)
     */
    private _pawn_can_move_to(pawn: Piece, coord: Coordinate): boolean {
        /*
         * If the pawn is capturing, it must
         * be on a diagonal square and the
         * destination square must be occupied
         * by a piece of the opposite color.
         */
        if(!this.board[coord.rank][coord.file].is_empty()) {
            return Math.abs(pawn.location.file - coord.file) === 1 &&
                   Math.abs(pawn.location.rank - coord.rank) === 1 &&
                   this.board[coord.rank][coord.file].piece.color !== pawn.color;
        }

        /*
         * Can En passant if the pawn is next to another 
         * pawn of the opposite color, and the destination
         * square is not occupied. (observer handles other cases)
         */
        if (pawn.color === ColorType.White) {
            if (pawn.location.rank === 4 && pawn.location.file !== coord.file) {
                return this.board[coord.rank][coord.file].is_empty() &&
                       this.board[coord.rank - 1][coord.file].piece.type === PieceType.Pawn && 
                       this.board[coord.rank - 1][coord.file].piece.color !== pawn.color;
            }
        } else {
            if (pawn.location.rank === 3 && pawn.location.file !== coord.file) {
                return Math.abs(pawn.location.file - coord.file) === 1 &&
                       this.board[coord.rank][coord.file].is_empty() &&
                       this.board[coord.rank + 1][coord.file].piece.type === PieceType.Pawn &&
                       this.board[coord.rank + 1][coord.file].piece.color !== pawn.color;
            }
        }

        /* Quick check to see if the pawn is moving forward */
        if (pawn.location.file !== coord.file) { return false; }

        /*
         * If the pawn is moving forward two
         * spaces, it must be on its starting
         * rank and the destination square and
         * intermediate square must be empty.
         */
        if (pawn.color === ColorType.White) {
            if (pawn.location.rank === 1 && coord.rank === 3) {
                return pawn.location.file === coord.file &&
                       this.board[2][coord.file].is_empty() &&
                       this.board[3][coord.file].is_empty();
            }
        } else {
            if (pawn.location.rank === 6 && coord.rank === 4) {
                return pawn.location.file === coord.file &&
                       this.board[5][coord.file].is_empty() &&
                       this.board[4][coord.file].is_empty();
            }
        }

        /*
         * If the pawn is moving forward one
         * space, it must be on an adjacent
         * rank and the destination square
         * must be empty.
         */
        if (pawn.color === ColorType.White) {
            if (pawn.location.rank === coord.rank - 1) {
                return pawn.location.file === coord.file &&
                       this.board[coord.rank][coord.file].is_empty();
            }
        } else {
            if (pawn.location.rank === coord.rank + 1) {
                return pawn.location.file === coord.file &&
                       this.board[coord.rank][coord.file].is_empty();
            }
        }

        /*
         * All other cases are invalid,
         * or are completely gibberish.
         * 
         * (Unless I'm missing something)
         */
        return false;
    }

    toString (): string {
        return '';
    }
}
