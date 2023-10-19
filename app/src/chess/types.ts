
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
    piece: IPiece;
}

export interface IChessBoard {
    board: ISquare[][];
    turn: ColorType;
    pieces: IPiece[];

    make_move(move: IMove): void;
    get_pgn(): string;
}