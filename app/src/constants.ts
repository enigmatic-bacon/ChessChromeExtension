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
        const index = message.lastIndexOf('a');
        let modifiedString = message;
        if (index >= 0 && index === message.length - 2) {
        // Replace the 'A' with 'hey'
        modifiedString = message.slice(0, index) + 'A' + message.slice(index + 1);
        }
        const msg = new SpeechSynthesisUtterance(modifiedString);
        msg.lang = 'en-US';
        console.log(msg);
        window.speechSynthesis.speak(msg);
    }
}

export class SpeechClassifierGrammar {
    static readonly CHESS_PIECES: string[] = [
        'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'
    ];

    static readonly CHESS_FILES: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' 
    ];

    static readonly CHESS_RANKS: string[] = [
        '1', '2', '3', '4', '5', '6', '7', '8' 
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

    // static readonly CHESS_AMBIGIOUS_ACTIONS: string[] = [
    //     'aa1', 'aa2', 'aa3', 'aa4', 'aa5', 'aa6', 'aa7', 'aa8',
    //     'ab1', 'ab2', 'ab3', 'ab4', 'ab5', 'ab6', 'ab7', 'ab8',
    //     'ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6', 'ac7', 'ac8',
    //     'ad1', 'ad2', 'ad3', 'ad4', 'ad5', 'ad6', 'ad7', 'ad8',
    //     'ae1', 'ae2', 'ae3', 'ae4', 'ae5', 'ae6', 'ae7', 'ae8',
    //     'af1', 'af2', 'af3', 'af4', 'af5', 'af6', 'af7', 'af8',
    //     'ag1', 'ag2', 'ag3', 'ag4', 'ag5', 'ag6', 'ag7', 'ag8',
    //     'ah1', 'ah2', 'ah3', 'ah4', 'ah5', 'ah6', 'ah7', 'ah8',
    //     'ba1', 'ba2', 'ba3', 'ba4', 'ba5', 'ba6', 'ba7', 'ba8',
    //     'bb1', 'bb2', 'bb3', 'bb4', 'bb5', 'bb6', 'bb7', 'bb8',
    //     'bc1', 'bc2', 'bc3', 'bc4', 'bc5', 'bc6', 'bc7', 'bc8',
    //     'bd1', 'bd2', 'bd3', 'bd4', 'bd5', 'bd6', 'bd7', 'bd8',
    //     'be1', 'be2', 'be3', 'be4', 'be5', 'be6', 'be7', 'be8',
    //     'bf1', 'bf2', 'bf3', 'bf4', 'bf5', 'bf6', 'bf7', 'bf8',
    //     'bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8',
    //     'bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'bh6', 'bh7', 'bh8',
    //     'ca1', 'ca2', 'ca3', 'ca4', 'ca5', 'ca6', 'ca7', 'ca8',
    //     'cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6', 'cb7', 'cb8',
    //     'cc1', 'cc2', 'cc3', 'cc4', 'cc5', 'cc6', 'cc7', 'cc8',
    //     'cd1', 'cd2', 'cd3', 'cd4', 'cd5', 'cd6', 'cd7', 'cd8',
    //     'ce1', 'ce2', 'ce3', 'ce4', 'ce5', 'ce6', 'ce7', 'ce8',
    //     'cf1', 'cf2', 'cf3', 'cf4', 'cf5', 'cf6', 'cf7', 'cf8',
    //     'cg1', 'cg2', 'cg3', 'cg4', 'cg5', 'cg6', 'cg7', 'cg8',
    //     'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8',
    //     'da1', 'da2', 'da3', 'da4', 'da5', 'da6', 'da7', 'da8',
    //     'db1', 'db2', 'db3', 'db4', 'db5', 'db6', 'db7', 'db8',
    //     'dc1', 'dc2', 'dc3', 'dc4', 'dc5', 'dc6', 'dc7', 'dc8',
    //     'dd1', 'dd2', 'dd3', 'dd4', 'dd5', 'dd6', 'dd7', 'dd8',
    //     'de1', 'de2', 'de3', 'de4', 'de5', 'de6', 'de7', 'de8',
    //     'df1', 'df2', 'df3', 'df4', 'df5', 'df6', 'df7', 'df8',
    //     'dg1', 'dg2', 'dg3', 'dg4', 'dg5', 'dg6', 'dg7', 'dg8',
    //     'dh1', 'dh2', 'dh3', 'dh4', 'dh5', 'dh6', 'dh7', 'dh8',
    //     'ea1', 'ea2', 'ea3', 'ea4', 'ea5', 'ea6', 'ea7', 'ea8',
    //     'eb1', 'eb2', 'eb3', 'eb4', 'eb5', 'eb6', 'eb7', 'eb8',
    //     'ec1', 'ec2', 'ec3', 'ec4', 'ec5', 'ec6', 'ec7', 'ec8',
    //     'ed1', 'ed2', 'ed3', 'ed4', 'ed5', 'ed6', 'ed7', 'ed8',
    //     'ee1', 'ee2', 'ee3', 'ee4', 'ee5', 'ee6', 'ee7', 'ee8',
    //     'ef1', 'ef2', 'ef3', 'ef4', 'ef5', 'ef6', 'ef7', 'ef8',
    //     'eg1', 'eg2', 'eg3', 'eg4', 'eg5', 'eg6', 'eg7', 'eg8',
    //     'eh1', 'eh2', 'eh3', 'eh4', 'eh5', 'eh6', 'eh7', 'eh8',
    //     'fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6', 'fa7', 'fa8',
    //     'fb1', 'fb2', 'fb3', 'fb4', 'fb5', 'fb6', 'fb7', 'fb8',
    //     'fc1', 'fc2', 'fc3', 'fc4', 'fc5', 'fc6', 'fc7', 'fc8',
    //     'fd1', 'fd2', 'fd3', 'fd4', 'fd5', 'fd6', 'fd7', 'fd8',
    //     'fe1', 'fe2', 'fe3', 'fe4', 'fe5', 'fe6', 'fe7', 'fe8',
    //     'ff1', 'ff2', 'ff3', 'ff4', 'ff5', 'ff6', 'ff7', 'ff8',
    //     'fg1', 'fg2', 'fg3', 'fg4', 'fg5', 'fg6', 'fg7', 'fg8',
    //     'fh1', 'fh2', 'fh3', 'fh4', 'fh5', 'fh6', 'fh7', 'fh8',
    //     'ga1', 'ga2', 'ga3', 'ga4', 'ga5', 'ga6', 'ga7', 'ga8',
    //     'gb1', 'gb2', 'gb3', 'gb4', 'gb5', 'gb6', 'gb7', 'gb8',
    //     'gc1', 'gc2', 'gc3', 'gc4', 'gc5', 'gc6', 'gc7', 'gc8',
    //     'gd1', 'gd2', 'gd3', 'gd4', 'gd5', 'gd6', 'gd7', 'gd8',
    //     'ge1', 'ge2', 'ge3', 'ge4', 'ge5', 'ge6', 'ge7', 'ge8',
    //     'gf1', 'gf2', 'gf3', 'gf4', 'gf5', 'gf6', 'gf7', 'gf8',
    //     'gg1', 'gg2', 'gg3', 'gg4', 'gg5', 'gg6', 'gg7', 'gg8',
    //     'gh1', 'gh2', 'gh3', 'gh4', 'gh5', 'gh6', 'gh7', 'gh8',
    //     'ha1', 'ha2', 'ha3', 'ha4', 'ha5', 'ha6', 'ha7', 'ha8',
    //     'hb1', 'hb2', 'hb3', 'hb4', 'hb5', 'hb6', 'hb7', 'hb8',
    //     'hc1', 'hc2', 'hc3', 'hc4', 'hc5', 'hc6', 'hc7', 'hc8',
    //     'hd1', 'hd2', 'hd3', 'hd4', 'hd5', 'hd6', 'hd7', 'hd8',
    //     'he1', 'he2', 'he3', 'he4', 'he5', 'he6', 'he7', 'he8',
    //     'hf1', 'hf2', 'hf3', 'hf4', 'hf5', 'hf6', 'hf7', 'hf8',
    //     'hg1', 'hg2', 'hg3', 'hg4', 'hg5', 'hg6', 'hg7', 'hg8',
    //     'hh1', 'hh2', 'hh3', 'hh4', 'hh5', 'hh6', 'hh7', 'hh8'
    // ];

    static readonly GENERAL_CHESS_WORDS: string[] = [
        ...SpeechClassifierGrammar.CHESS_PIECES,
        ...SpeechClassifierGrammar.CHESS_COORDINATES,
        ...SpeechClassifierGrammar.CHESS_ACTIONS,
        ...SpeechClassifierGrammar.CASTLE_ACTIONS,
        ...SpeechClassifierGrammar.PROMOTION_ACTIONS,
        ...SpeechClassifierGrammar.CHESS_FILES,
        ...SpeechClassifierGrammar.CHESS_RANKS,
        //...SpeechClassifierGrammar.CHESS_AMBIGIOUS_ACTIONS
        
    ];
}
