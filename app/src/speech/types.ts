export type WindowSpeech = typeof window & {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

export type SpeechRecognition = {
    maxAlternatives: number;
    interimResults: boolean;
    
    addEventListener: (event: string, callback: any) => void;
    start: () => void;
    stop: () => void;
}

export type SpeechClassifierResult = {
    word: string;
    /* Confidence realtive to all words in the grammar */
    rel_confidence: number;

    /* Confidence relative to results */
    confidence: number;
}

export interface ISpeechClassifier {
    grammar: string[];
    set_grammar(grammar: string[]): void;
    classify_word(word: string): SpeechClassifierResult[];
    classify_sentence(sentence: string): SpeechClassifierResult[][];
}