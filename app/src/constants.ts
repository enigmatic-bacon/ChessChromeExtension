export class Constants {
    /* Sleep script */
    static readonly SLEEP_INTERVAL: number = 1000; // One second

    /* Chess script */
    static readonly BOARD_SIZE: number = 8;
    
    /* General Chess Constants */
    static readonly FILES: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    static readonly PIECE_TYPES: string[] = ['p', 'n', 'b', 'r', 'q', 'k'];
    static readonly CASTLE_INDICATOR: string = 'o';
    static readonly CAPTURE_INDICATOR: string = 'x';
}