import {
    ColorType,
    PieceType,
    ICoordinate,
    IMove,
    IPiece
} from './types';

import {
    file_to_index
} from './utils';

export class Coordinate implements ICoordinate {
    rank: number;
    file: number;

    constructor(rank: number, file: number) {
        this.rank = rank;
        this.file = file;
    }

    toString (): string {
        return `${String.fromCharCode(this.file + 97)}${this.rank + 1}`;
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
                const pos_info: string = className.split('-')[1];
            
                const file: number = file_to_index(pos_info.slice(0, 1));
                const rank = parseInt(pos_info.slice(1)) - 1;

                this.location = new Coordinate(rank, file);

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