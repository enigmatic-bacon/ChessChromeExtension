import { Move } from "./chess/Move";

export type Nullable<T> = T | null;

export class Constants {
    /* Sleep script */
    static readonly SLEEP_INTERVAL: number = 1000; // One second

    /* Chess script */
    static readonly BOARD_SIZE: number = 8;
    static readonly OBSERVER_INTERVAL: number = 10; // ms
    
    /* General Chess Constants */
    static readonly FILES: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    static readonly PIECE_TYPES: string[] = ['p', 'n', 'b', 'r', 'q', 'k'];
    static readonly CASTLE_INDICATOR: string = 'o';
    static readonly CAPTURE_INDICATOR: string = 'x';
}

export class ErrorHelper {
    static readonly E_INFO = "[INFO]";
    static readonly E_WARN = "[WARN]";
    static readonly E_ERROR = "[ERROR]";

    static readonly INVALID_FILE = "Invalid file";
    static readonly INVALID_RANK = "Invalid rank";

    static readonly INVALID_COLOR = "Invalid color";
    static readonly INVALID_PIECE = "Invalid piece";

    static readonly INVALID_MOVE = "Invalid move";
    static readonly AMBIGUOUS_MOVE = "Ambiguous move";
    static readonly INVALID_PROMOTION = "Invalid promotion";

    static readonly NON_POSITIVE_NUM = "Non-positive number";

    static throw_error(error: string, message: string, speak: boolean = false): void {
        const err_string: string = `${error}: ${message}`;
        if (speak) MoveSpeaker.speak_message(err_string);
        throw new Error(err_string);
    }
}

export class MoveSpeaker {
    static speak_message(message: string): void {
        const msg = new SpeechSynthesisUtterance(message);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }
}

export class SpeechClassifierGrammar {
    static readonly CHESS_PIECES: string[] = [
        'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'
    ];

    static readonly CHESS_COORDINATES: string[] = [
        'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
        'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8',
        'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8',
        'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
        'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
        'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8',
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'
    ];

    static readonly CHESS_ACTIONS: string[] = [
        'capture', 'captures', 'takes',
        'to', 'move', 'moves'
    ];

    static readonly CASTLE_ACTIONS: string[] = [
        'castle', 'castles',
        'long', 'short'
    ];

    static readonly PROMOTION_ACTIONS: string[] = [
        'promotes', 'promote', 
        'equals', 'equal'
    ];

    static readonly GENERAL_CHESS_WORDS: string[] = [
        ...SpeechClassifierGrammar.CHESS_PIECES,
        ...SpeechClassifierGrammar.CHESS_COORDINATES,
        ...SpeechClassifierGrammar.CHESS_ACTIONS,
        ...SpeechClassifierGrammar.CASTLE_ACTIONS,
        ...SpeechClassifierGrammar.PROMOTION_ACTIONS
        
    ];
}
