
import {
    SpeechClassifier
} from './SpeechClassifier/index'

import {
    SpeechClassifierGrammar
} from '../constants';

import {
    WindowSpeech,
    SpeechRecognition
} from './types';

const speech_window: WindowSpeech = window as WindowSpeech;

speech_window.SpeechRecognition = speech_window.SpeechRecognition ||
                                  speech_window.webkitSpeechRecognition; 

const recognition: SpeechRecognition = new speech_window.SpeechRecognition();

const classifier = new SpeechClassifier(
    SpeechClassifierGrammar.GENERAL_CHESS_WORDS, 
    2
);

const _classify_result = (results: any): void => {
    const transcript = Array.from(results).map(
        result => result[0]
    ).map(result => 
        result.transcript
    ).join('');

    console.log(
        classifier.classify_sentence(transcript)
    );

}



const init_listen = () => {

    recognition.maxAlternatives = 1;
    recognition.interimResults = false;

    recognition.addEventListener('result', e => {
        _classify_result(e.results)
        recognition.stop();
    });
}

const listen = () => { recognition.start(); }

export {
    init_listen,
    listen
}



