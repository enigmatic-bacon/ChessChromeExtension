/* Speech Module beginning */

type WindowSpeech = typeof window & {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

(window as WindowSpeech).SpeechRecognition = 
    (window as WindowSpeech).SpeechRecognition ||
    (window as WindowSpeech).webkitSpeechRecognition; 

const recognition = new (window as WindowSpeech).SpeechRecognition();

recognition.maxAlternatives = 1;
recognition.interimResults = false;

const init_listen = () => {
    recognition.addEventListener('result', e => { 
        const transcript = Array.from(e.results) 
            .map(result => result[0]) 
            .map(result => result.transcript) 
            .join('') 
        console.log(transcript); 
        recognition.stop();
    });

    recognition.addEventListener('end', () => {
        recognition.stop();
    });
}

const listen = () => { recognition.start(); }

export {
    init_listen,
    listen
}



