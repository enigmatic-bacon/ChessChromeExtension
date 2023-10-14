(async () => {
    const msg = new SpeechSynthesisUtterance();

    const load_src = chrome.runtime.getURL("/popup/scripts/load_script.js");
    const control_src = chrome.runtime.getURL("/popup/scripts/control_script.js");
    const chess_src = chrome.runtime.getURL("/popup/scripts/chess_script.js");
    
    const {
        await_page_load
    } = await import(load_src);
    
    const {
        inject_dashboard,
        add_container_movement,
        get_move_from_form
    } = await import(control_src);
    
    const { 
        create_full_pgn,
        parse_move
    } = await import(chess_src);

    await await_page_load();
    await inject_dashboard();
    await add_container_movement();

    document.getElementById('controls-move-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const raw_move_text = await get_move_from_form();

        const parsed_move = await parse_move(raw_move_text);

        console.log(parsed_move)
    });

    document.getElementById('controls-get-pgn').addEventListener('click', async () => {
        
        msg.text = await create_full_pgn().then(PGN => PGN);

        document.getElementById('controls-pgn-result').innerHTML = msg.text;

        // window.speechSynthesis.speak(msg);
    });

})();