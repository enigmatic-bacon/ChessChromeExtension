const SLEEP_INTERVAL = 1000; // One second

/* Sleep for a given number of milliseconds */
const sleep = ms => new Promise(r => setTimeout(r, ms));

const await_page_load = async () => {
    /*
        Wait until the 'username' text appears on the page
        before moving into the main function.
    */
    while (document.getElementsByClassName('user-username-component').length === 0) {
        // console.log('Waiting for page to load');
        await sleep(SLEEP_INTERVAL);
    }
};

export {
    await_page_load
}