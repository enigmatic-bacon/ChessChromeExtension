const BOARD_DIMENSION: number = 8;

type Nullable<T> = T | null;

import {
    Constants
} from '../constants';

import {
    ColorType,
    PieceType,
    ICoordinate,
    ICoordinateFactory,
    IMove,
    IMoveFactory,
    IPiece,
    ISquare,
    IChessBoard
} from './types';

import {
    file_to_index,
    find_pieces,
    remove_piece,
    invert_color
} from './utils';

export class CoordinateFactory implements ICoordinateFactory {

    public static build_from_class(class_name: string): Coordinate {
        const coords: string = class_name.split('-')[1];

        const file: number = Number(coords.slice(0, 1)) - 1;
        const rank: number = Number(coords.slice(1)   ) - 1;

        return new Coordinate(rank, file);
    }

    public static build_from_string(coord: string): Coordinate {
        const file: number = file_to_index(coord.slice(0, 1));
        const rank: number = Number(coord.slice(1)) - 1;

        return new Coordinate(rank, file);
    }

    public static build_from_coords(rank: number, file: number): Coordinate {
        return new Coordinate(rank, file);
    }
}

export class MoveFactory implements IMoveFactory {

    public static build_from_string(board: ChessBoard,  move: string): Move {
        if (!move.length) { return; }

        console.log(board);
        console.log(board.pieces);

        /* 
         * Mess with the logic a little because 'b' is a valid file,
         * and 'B' is a valid piece type, so if we lowercase the move 
         * text then we can't tell if it's a file or a piece type.
         */
        const is_pawn_move: boolean = Constants.FILES.includes(move.slice(0, 1));

        if(is_pawn_move) {
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

        console.log(possible_pieces);

        possible_pieces.forEach(piece => {
            if (board.piece_can_move_to(piece, destination)) {
                if (move_piece) {
                    console.log("Ambiguous Move!");
                    return;
                }

                move_piece = piece;
            }
        });

        if (!move_piece) {
            console.log("Invalid Move!");
            return;
        }

        return new Move(move_piece.location, destination);
    }

    public static build_from_coords(from: ICoordinate, to: ICoordinate): Move {
        return new Move(from, to);
    }

    private static _create_pawn_move(board: ChessBoard, move: string): Move {
        return;
    }

    private static _create_castle_move(board: ChessBoard, castle_text: string): Move {
        return;
    }
}

export class Coordinate implements ICoordinate {
    rank: number;
    file: number;

    constructor(rank: number, file: number) {
        if (rank < 0 || rank >= BOARD_DIMENSION) {
            throw new Error(`Invalid rank: ${rank}`);
        }

        if (file < 0 || file >= BOARD_DIMENSION) {
            throw new Error(`Invalid file: ${file}`);
        }

        this.rank = rank;
        this.file = file;
    }

    toString (): string {
        return `(${this.file}, ${this.rank})`;
    }
}

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

export class Move implements IMove {
    from: Coordinate;
    to: Coordinate;

    constructor(from: Coordinate, to: Coordinate) {
        this.from = from;
        this.to = to;
    }
}

export class Piece implements IPiece {
    location: Coordinate;
    color: ColorType;
    type: PieceType;

    constructor(element: HTMLElement) {
        element.classList.forEach(className => {
            if (className.startsWith('piece')) { return; }

            else if (className.startsWith('square')) {
                this.location = CoordinateFactory.build_from_class(className);
                return;
            } else {
                this.type = className.slice(1).toLowerCase() as PieceType;
                this.color = className.slice(0, 1) as ColorType;
            }
        });
    }


    toString (): string {
        return `${this.color}${this.type} ${this.location.toString()}`;
    }
}

export class ChessBoard implements IChessBoard {
    board_element: HTMLElement;
    board: Square[][];
    turn: ColorType;
    player_color: ColorType;
    pieces: Piece[];

    constructor() {
        this.board_element = document.getElementById('board-single') ? 
                             document.getElementById('board-single') : 
                             document.getElementById('board-play-computer');

        this.player_color = this.board_element.classList.contains('flipped') ?
                            ColorType.Black : ColorType.White;

        this.board = Array(Constants.BOARD_SIZE).fill(null).map(() => Array(Constants.BOARD_SIZE).fill(null));
        this.pieces = Array();

        this.board.forEach((row, rank) => {
            row.forEach((square, file) => {
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

        const last_move_pair: Element[] = Array.from(this.board_element.children).filter(
            child => String(child.className).startsWith('highlight')
        );

        last_move_pair.forEach(move_html => {
            move_html.classList.forEach(className => {
                if (className.startsWith('square')) {
                    const coord: Coordinate = CoordinateFactory.build_from_class(className);

                    if (this.board[coord.rank][coord.file].piece) {
                        this.turn = invert_color(this.board[coord.rank][coord.file].piece.color);
                    }
                }
            });
        });

        return;
    }

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
    }

    public make_move(move: Move): void {

        const square_element: HTMLElement = this.board_element.querySelector(
            `.square-${move.from.file + 1}${move.from.rank + 1}`
        )

        const square_length: number = square_element.getBoundingClientRect().width;
        const origin_offset_x: number = this.board_element.getBoundingClientRect().x;
        const origin_offset_y: number = this.board_element.getBoundingClientRect().y;

        let event = new PointerEvent('pointerdown', {
            clientX: square_length * (move.from.file + 0.5) + origin_offset_x,
            clientY: square_length * (Constants.BOARD_SIZE - move.from.rank - 0.5) + origin_offset_y,
            bubbles: true
        });

        this.board_element.dispatchEvent(event);

        event = new PointerEvent('pointerup', {
            clientX: square_length * (move.to.file + 0.5) + origin_offset_x,
            clientY: square_length * (Constants.BOARD_SIZE - move.to.rank - 0.5) + origin_offset_y,
            bubbles: true
        });

        this.board_element.dispatchEvent(event);

        this.pieces = remove_piece(this.pieces, this.board[move.from.rank][move.from.file].piece);

        this.board[move.to.rank][move.to.file].piece = this.board[move.from.rank][move.from.file].piece;
        this.board[move.to.rank][move.to.file].piece.location = this.board[move.to.rank][move.to.file].location;
        this.board[move.from.rank][move.from.file].piece = null;

        this.pieces.push(this.board[move.to.rank][move.to.file].piece);
        
        console.log(this.pieces);

        return;
    }

    public get_pgn(): string {
        return '';
    }

    private _king_can_move_to(king: Piece, coord: Coordinate): boolean {
        const target_square = this.board[coord.rank][coord.file];

        if (target_square.is_attacked_by(invert_color(king.color))) {
            return false;
        }

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

    private _queen_can_move_to(queen: Piece, coord: Coordinate): boolean {
        if (queen.location.file === coord.file) {
            return this._rook_can_move_to(queen, coord);
        }

        if (queen.location.rank === coord.rank) {
            return this._rook_can_move_to(queen, coord);
        }

        return this._bishop_can_move_to(queen, coord);
    }

    private _rook_can_move_to(rook: Piece, coord: Coordinate): boolean {

        if (rook.location.file === coord.file) {
            const min = Math.min(rook.location.rank, coord.rank);
            const max = Math.max(rook.location.rank, coord.rank);

            for (let i = min + 1; i < max; i++) {
                if (!this.board[i][rook.location.file].is_empty()) {
                    return false;
                }
            }
        }

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

    private _pawn_can_move_to(pawn: Piece, coord: Coordinate): boolean {
        return true;
    }

    toString (): string {
        return '';
    }

}