const BOARD_DIMENSION: number = 8;

type Nullable<T> = T | null;

import {
    ColorType,
    PieceType,
    ICoordinate,
    ICoordinateFactory,
    IMove,
    IPiece,
    ISquare,
    IChessBoard
} from './types';

import {
    file_to_index,
    invert_color
} from './utils';

export class CoordinateFactory implements ICoordinateFactory {

    public static build_from_class(class_name: string): ICoordinate {
        const coords: string = class_name.split('-')[1];

        const file: number = Number(coords.slice(0, 1)) - 1;
        const rank: number = Number(coords.slice(1)   ) - 1;

        return new Coordinate(rank, file);
    }

    static build_from_coords(rank: number, file: number): ICoordinate {
        return new Coordinate(rank, file);
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

            if (className.startsWith('square')) {
                this.location = CoordinateFactory.build_from_class(
                    className
                );
                return;
            }

            this.type = className.slice(1).toLowerCase() as PieceType;
            this.color = className.slice(0, 1) as ColorType;
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
    pieces: Piece[];

    constructor() {
        this.board_element = document.getElementById('board-single') ? 
                             document.getElementById('board-single') : 
                             document.getElementById('board-play-computer');

        this.board = [];

        for (let rank: number = 0; rank < BOARD_DIMENSION; rank++) {
            const row: Square[] = [];

            for (let file: number = 0; file < BOARD_DIMENSION; file++) {
                row.push(
                    new Square(
                        CoordinateFactory.build_from_coords(rank, file)
                    )
                );
            }

            this.board.push(row);
        }

        const pieces_html: Element[] = Array.from(this.board_element.children).filter(
            child => String(child.className).startsWith('piece')
        );

        pieces_html.forEach(piece_html => {
            const piece: Piece = new Piece(piece_html as HTMLElement);

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

    make_move(move: Move): void {
        return;
    }

    get_pgn(): string {
        return '';
    }

}