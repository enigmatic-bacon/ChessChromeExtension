import {
    Constants,
    ErrorHelper
} from '../../constants';

import {
    ICoordinate,
    ICoordinateFactory
} from '../types';

import {
    file_to_index
} from './utils';

/*
 * CoordinateFactory class, allows for
 * the dynamic creation of Coordinate objects.
 * 
 * @method build_from_class - Given an HTML class name,
 *                            return a Coordinate object.
 *                            Helps with chess.com boards.
 * 
 *      Example: 'square-a1' -> Coordinate(0, 0)
 *               'square-h8' -> Coordinate(7, 7)
 * 
 * @method build_from_string - Given a string, return
 *                            a Coordinate object.
 *      
 *      Example: 'a1' -> Coordinate(0, 0)
 *               'h8' -> Coordinate(7, 7)
 * 
 * 
 * @method build_from_coords - Given a rank and file,
 *                           return a Coordinate object.
 * 
 *      Example: (0, 0) -> Coordinate(0, 0)
 *               (7, 7) -> Coordinate(7, 7)
 */
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

    /*
     * Verify that the rank and file are valid
     * board coordinates, then construct the
     * Coordinate object.
     * 
     * @param {number} rank - The rank of the coordinate.
     * @param {number} file - The file of the coordinate.
     * @returns {Coordinate} - The Coordinate object.
     * @throws {Error} - If the rank or file are invalid.
     */

    constructor(rank: number, file: number) {
        if (rank < 0 || rank >= Constants.BOARD_SIZE) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_RANK);
        }

        if (file < 0 || file >= Constants.BOARD_SIZE) {
            ErrorHelper.throw_error(ErrorHelper.E_ERROR, ErrorHelper.INVALID_FILE);
        }

        this.rank = rank;
        this.file = file;
    }

    /* 
     * Return a text-reader friendly
     * representation of the coordinate 
     * object. For most coordinates,
     * this is the file (letter) and rank.
     */
    public to_speech (): string {
        return `${Constants.FILES[this.file]}${this.rank + 1}`;
    }

    toString (): string {
        return `(${this.file}, ${this.rank})`;
    }
}