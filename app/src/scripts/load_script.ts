'use strict';

const SLEEP_INTERVAL: number = 1000; // One second

/* Sleep for a given number of milliseconds */
const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

const await_page_load = async (): Promise<void> => {
    /*
     * Wait until the resign flag appears on the page
     * before returning. This ensures that no part of
     * the chess board is in the default state.
    */
    while (document.getElementsByClassName('flag').length === 0) {
        await sleep(SLEEP_INTERVAL);
    }

    return;
};

export {
    await_page_load
}