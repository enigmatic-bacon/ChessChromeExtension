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

    main();
})();