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
    static readonly INVALID_PROMOTION = "Invalid promotion";
    static readonly AMBIGUOUS_MOVE = "Ambiguous move";

    static throw_error(error: string, message: string): void {
        throw new Error(`${error}: ${message}`);
    }
}

export class MoveSpeaker {
    static speak_message(message: string): void {
        const msg = new SpeechSynthesisUtterance(message);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }
}