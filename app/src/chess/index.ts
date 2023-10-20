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

    public static build_from_string(board: ChessBoard, color: ColorType, move: string): Move {
        if (!move.length) { return; }

        /* 
         * Mess with the logic a little because 'b' is a valid file,
         * and 'B' is a valid piece type, so if we lowercase the move 
         * text then we can't tell if it's a file or a piece type.
         */
        const is_pawn_move: boolean = Constants.FILES.includes(move.slice(0, 1));

        if(is_pawn_move) {
            return this._create_pawn_move(board.pieces, color, move);
        }

        move = move.trim().toLowerCase();

        if (move.slice(0, 1) === Constants.CASTLE_INDICATOR) {
            return this._create_castle_move(board.pieces, color, move);
        }

        const piece_type: PieceType = move.slice(0, 1) as PieceType;

        const possible_pieces: Piece[] = find_pieces(board.pieces, color, piece_type);

        if (!possible_pieces.length) { return; 0 }

        const destination_text: string = move.slice(1, 2) === Constants.CAPTURE_INDICATOR ?
                                         move.slice(2) : move.slice(1);

        const destination: Coordinate = CoordinateFactory.build_from_string(destination_text);
    }

    public static build_from_coords(from: ICoordinate, to: ICoordinate): Move {
        return new Move(from, to);
    }

    private static _create_pawn_move(pieces: Piece[], color: ColorType, move: string): Move {
        return;
    }

    private static _create_castle_move(pieces: Piece[], color: ColorType, castle_text: string): Move {
        return;
    }
}

export class Coordinate implements ICoordinate {
    rank: number;
    file: number;

    constructor(rank: number, file: number) {
        this.rank = rank;
        this.file = file;
    }

    toString (): string {
        return `(${this.rank}, ${this.file})`;
    }
}

export class Square implements ISquare {
    location: Coordinate;
    piece: Nullable<Piece>;

    constructor(coord: Coordinate) {
        this.location = coord;
        this.piece = null;
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

        return true;
    }

    public make_move(move: Move): void {
        return;
    }

    public get_pgn(): string {
        return '';
    }

    private _king_can_move_to(king: Piece, coord: Coordinate): boolean {
        return true;
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
        return true;
    }

    private _bishop_can_move_to(bishop: Piece, coord: Coordinate): boolean {
        return true;
    }

    private _knight_can_move_to(knight: Piece, coord: Coordinate): boolean {
        return true;
    }

    private _pawn_can_move_to(pawn: Piece, coord: Coordinate): boolean {
        return true;
    }

    toString (): string {
        return '';
    }

}