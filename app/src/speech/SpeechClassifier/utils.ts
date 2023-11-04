import {
    PieceType
} from '../../chess/types';
import {
    SpeechClassifierGrammar,
    Constants
} from '../../constants'

export const word_to_piece = (word: string): PieceType => {
    return Constants.PIECE_TYPES[
        SpeechClassifierGrammar.CHESS_PIECES.indexOf(word)
    ] as PieceType;

}
