
import {
    IPiece,
    PieceType,
    ColorType
} from '../types';

import {
    Coordinate,
    CoordinateFactory
} from '../Coordinate/index';


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

    equals (piece: Piece): boolean {
        return this.location.rank === piece.location.rank &&
               this.location.file === piece.location.file &&
               this.color === piece.color &&
               this.type === piece.type;
    }

    toString (): string {
        return `${this.color}${this.type} ${this.location.toString()}`;
    }
}