
/* Track the movement of the controls container */
var isDown = false;

/* Inject the controls container into the page */
const inject_dashboard = async () => {

    const controls_url = chrome.runtime.getURL('/popup/html/controls.html');
    const container_html = await (await fetch(controls_url)).text();

    const container = document.createElement('div');

    container.innerHTML = container_html.trim();

    document.getElementById('board-layout-main').appendChild(container.firstChild);
}

/* Add movement to the controls container */
const add_container_movement = () => {

    const container_mover = document.getElementById('voice-container-mover')
    const controls_container = document.getElementById('voice-container');

    container_mover.addEventListener('mousedown', () => {
        isDown = true;
    }, true);

    document.addEventListener('mouseup', () => {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', (e) => {
        e.preventDefault();

        if (isDown) {
            controls_container.style.position = 'absolute';

            var deltaX = e.clientX;
            var deltaY = e.clientY;
            var rect = controls_container.getBoundingClientRect();
            controls_container.style.left = Math.min(deltaX - rect.width, window.innerWidth - rect.width * 2) + 'px';
            controls_container.style.top  = Math.min(deltaY - rect.height, window.innerHeight - rect.height * 2) + 'px';
        }

     }, true);

    return controls_container;
}

export {
    inject_dashboard,
    add_container_movement
}