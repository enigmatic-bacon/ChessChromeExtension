import {
    Constants,
} from '../../constants';

import {
    ICoordinate,
    ICoordinateFactory
} from '../types';

import {
    file_to_index
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

export class Coordinate implements ICoordinate {
    rank: number;
    file: number;

    constructor(rank: number, file: number) {
        if (rank < 0 || rank >= Constants.BOARD_SIZE) {
            throw new Error(`Invalid rank: ${rank}`);
        }

        if (file < 0 || file >= Constants.BOARD_SIZE) {
            throw new Error(`Invalid file: ${file}`);
        }

        this.rank = rank;
        this.file = file;
    }

    public to_speech (): string {
        return `${Constants.FILES[this.file]}${this.rank + 1}`;
    }

    toString (): string {
        return `(${this.file}, ${this.rank})`;
    }
}