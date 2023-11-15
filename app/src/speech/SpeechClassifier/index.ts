import {
    ISpeechClassifier,
    SpeechClassifierResult
} from '../types';

import {
    SpeechClassifierGrammar
} from '../../constants';

import {
    word_to_piece
} from './utils'

import {
    PieceType
} from '../../chess/types';
import { Piece } from '../../chess/Piece';

export class SpeechClassifier implements ISpeechClassifier {
    grammar: string[];

    private num_results: number;

    constructor(public init_grammar: string[], num_results: number = 1) {
        this.grammar = init_grammar;
        this.num_results = num_results;
    }

    public set_grammar(grammar: string[]): void {
        this.grammar = grammar;
    }

    /*
     * Given a word, returns an array of SpeechClassifierResults
     * that represent the confidence of the word being each
     * word in the grammar.
     * 
     * @param word The word to classify
     * @returns {SpeechClassifierResult[]} The results for the word
     */
    public classify_word(word: string): SpeechClassifierResult[] {
        let results: SpeechClassifierResult[] = [];

        word = word.toLowerCase().trim();

        this.grammar.forEach(gram => {
            const distance = this._get_levenshtein_distance(word, gram);
            const confidence = 1 / (distance + 1);

            results.push({
                word: gram,
                confidence: confidence,
                rel_confidence: 0
            });
        });

        let total_rel_confidence: number = 0;
        let total_confidence: number = 0;

        /* Normalize confidence */
        results.forEach(result => {
            total_rel_confidence += result.confidence;
        });

        results = results.sort((a, b) => {
            return b.confidence - a.confidence;
        });

        results = results.slice(0, this.num_results);

        results.forEach(result => {
            total_confidence += result.confidence;
        });

        results.forEach(result => {
            result.rel_confidence = result.confidence / total_rel_confidence;
            result.confidence /= total_confidence;
        });

        return results;
    }
    
    /*
     * Given a sentence, returns an array of arrays
     * of SpeechClassifierResults. Each inner array
     * represents the results for a word in the sentence.
     * 
     * @param sentence The sentence to classify
     * @returns {SpeechClassifierResult[][]} The results for each word in the sentence
     */
    public classify_sentence(sentence: string): SpeechClassifierResult[][] {
        const results: SpeechClassifierResult[][] = [];

        console.log(sentence);
        sentence.split(' ').forEach(word => {
            if (word.length === 3) {
                results.push(this.classify_word(word.charAt(0)));
                results.push(this.classify_word(word.slice(-2)));
            }
            else {
            results.push(this.classify_word(word));
            }
        });

        return results;
    }

    /*
     * Given a list of results, returns the
     * string-algebraic notation for the move
     * 
     * @param results The results of the classifier
     * @returns {string} The string-algebraic notation for the move
     */
    public results_to_move(results: SpeechClassifierResult[][]): string {
        let move: string = '';

        const top_results: string[] = [];

        results.forEach( result => {
            top_results.push(result[0].word);
        });

        console.log(top_results.join(' '));

        if (top_results.includes(SpeechClassifierGrammar.CASTLE_ACTIONS[0]) ||
            top_results.includes(SpeechClassifierGrammar.CASTLE_ACTIONS[1])) {

            /* long */
            if (top_results.includes(SpeechClassifierGrammar.CASTLE_ACTIONS[2])) {
                return 'O-O-O';
            }
            if (top_results.includes(SpeechClassifierGrammar.CASTLE_ACTIONS[3])) {
                return 'O-O';
            }
            
            return 'O-O?'
        }

        top_results.forEach( result => {
            if (SpeechClassifierGrammar.CHESS_PIECES.includes(result)) {
                /* Handle piece */
                const piece_type: PieceType = word_to_piece(result);
                if (piece_type === PieceType.Pawn) return;
                if (piece_type === PieceType.Bishop) {
                    move += PieceType.Bishop.toUpperCase();
                    return;
                }
                
                move += piece_type;
                return;
            }

            if (SpeechClassifierGrammar.CHESS_RANKS.includes(result) || 
                SpeechClassifierGrammar.CHESS_FILES.includes(result)) {
                move += result;
                return;
            }

            if (SpeechClassifierGrammar.CHESS_COORDINATES.includes(result)) {
                move += result;
                return;
            }

            if (SpeechClassifierGrammar.PROMOTION_ACTIONS.includes(result)) {
                move += '=';
                return;
            }

            // if (SpeechClassifierGrammar.CHESS_AMBIGIOUS_ACTIONS.includes(result)) {
            //     move += result;
            //     return;
            // }
        });

        console.log(move);
        
        return move;
    }

    /*
     * Given two words, returns the
     * Levenshtein distance between them
     * 
     * The Levenshtein distance is the minimum number 
     * of edits needed to transform one string into
     * the other (insertion, deletion, substitution)
     * 
     * Note: Thank you EECS 376 for teaching me this.
     * 
     * @param word1 The first word
     * @param word2 The second word
     * @returns {number} The Levenshtein distance between the two words
     */
    private _get_levenshtein_distance(word1: string, word2: string): number {
        const len1 = word1.length;
        const len2 = word2.length;

        const matrix: number[][] = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [];
            matrix[i][0] = i;
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        /* Shoutout to Dynamic Programming */
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[len1][len2];
    }
}