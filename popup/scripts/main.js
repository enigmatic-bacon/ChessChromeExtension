(async () => {
    const load_src = chrome.runtime.getURL("/popup/scripts/load_script.js");
    const control_src = chrome.runtime.getURL("/popup/scripts/control_script.js");
    const chess_src = chrome.runtime.getURL("/popup/scripts/chess_script.js");
    
    
    const { await_page_load } = await import(load_src);
    
    const {
        inject_dashboard,
        add_container_movement
    } = await import(control_src);
    
    const { 
        main
    } = await import(chess_src);

    
    await await_page_load();

    await inject_dashboard();

    await add_container_movement();

    const msg = new SpeechSynthesisUtterance();

    document.getElementById('controls-get-pgn').addEventListener('click', async () => {
        
        msg.text = await main().then(PGN => PGN);

        document.getElementById('controls-pgn-result').innerHTML = msg.text;

        // window.speechSynthesis.speak(msg);
    });

})();

/*

    let msg = new SpeechSynthesisUtterance();

    document.getElementById('controls-get-pgn').addEventListener('click', async () => {
        msg.text = await main().then(PGN => PGN);
        document.getElementById('controls-pgn-result').innerHTML = msg.text;

        window.speechSynthesis.speak(msg);
    });

*/