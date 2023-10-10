
/* Track the movement of the controls container */
var isDown = false;

var controls_are_down = true;

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

    const container_mover = document.getElementById('voice-container-mover');
    const container_minimizer = document.getElementById('voice-container-minimizer');
    const container_minimizer_text = document.getElementById('minimizer-text');
    const controls_container = document.getElementById('voice-container');
    const voice_controls = document.getElementById('voice-controls');

    container_mover.addEventListener('mousedown', () => {
        isDown = true;
    }, true);

    document.addEventListener('mouseup', () => {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', (e) => {
        e.preventDefault();

        /* Handle moving the controls container */
        if (isDown) {
            controls_container.style.position = 'fixed';

            var deltaX = e.clientX;
            var deltaY = e.clientY;
            var rect = controls_container.getBoundingClientRect();

            controls_container.style.left = deltaX - rect.width + 16 + 'px';
            controls_container.style.top  = deltaY - 24 + 'px';
        }

    }, true);

    container_minimizer.addEventListener('click', () => {
        if (controls_are_down) {
            voice_controls.style.display = 'none';
            container_minimizer_text.innerHTML = '▼';
            controls_container.style.width = 'fit-content';
            
            
        } else {
            voice_controls.style.display = 'flex';
            container_minimizer_text.innerHTML = '▲';
            controls_container.style.width = '50%';
        }

        controls_are_down = !controls_are_down;
    });


    return controls_container;
}

export {
    inject_dashboard,
    add_container_movement
}