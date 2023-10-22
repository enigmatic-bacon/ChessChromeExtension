
export type Nullable<T> = T | null;

export enum ColorType {
    White = 'w',
    Black = 'b'
}

export enum PieceType {
    Pawn = 'p',
    Knight = 'n',
    Bishop = 'b',
    Rook = 'r',
    Queen = 'q',
    King = 'k'
}

export interface ICoordinateFactory { }

export interface IMoveFactory { }

export interface ICoordinate {
    rank: number;
    file: number;
}

export interface IMove {
    from: ICoordinate;
    to: ICoordinate;
}

export interface IPiece {
    location: ICoordinate;
    color: ColorType;
    type: PieceType;
}

export interface ISquare {
    location: ICoordinate;
    piece: Nullable<IPiece>;

    is_empty(): boolean;
}

export interface IChessBoard {
    board_element: HTMLElement;
    board: ISquare[][];
    turn: ColorType;
    player_color: ColorType;
    pieces: IPiece[];

    make_move(move: IMove): void;
    get_pgn(): string;
}