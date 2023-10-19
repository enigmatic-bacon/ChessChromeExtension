
/* Track the movement of the controls container */
var mouse_down = false;

var controls_visible = true;

/* Inject the controls container into the page */
const inject_dashboard = async () => {

    const controls_url = chrome.runtime.getURL('/html/controls.html');
    
    const container_html = await (await fetch(controls_url)).text();

    const container = document.createElement('div');

    container.innerHTML = container_html.trim();

    document.getElementById('board-layout-main').appendChild(container.firstChild);

    document.getElementById('voice-container-mover').children[0].src = chrome.runtime.getURL('/icons/move-icon.png');
    document.getElementById('voice-container-minimizer').children[0].src = chrome.runtime.getURL('/icons/drop-icon.png');

}

/* Add movement to the controls container */
const add_container_movement = () => {

    const container_mover = document.getElementById('voice-container-mover');
    const container_minimizer = document.getElementById('voice-container-minimizer');
    const controls_container = document.getElementById('voice-container');
    const voice_controls = document.getElementById('voice-controls');

    container_mover.addEventListener('mousedown', () => {
        mouse_down = true;
    }, true);

    document.addEventListener('mouseup', () => {
        mouse_down = false;
        container_mover.style.cursor = 'grab';
    }, true);

    document.addEventListener('mousemove', (e) => {
        e.preventDefault();

        /* Handle moving the controls container */
        if (mouse_down) {
            controls_container.style.position = 'fixed';

            var deltaX = e.clientX;
            var deltaY = e.clientY;
            var rect = controls_container.getBoundingClientRect();

            controls_container.style.left = deltaX - rect.width + 16 + 'px';
            controls_container.style.top  = deltaY - 24 + 'px';
            container_mover.style.cursor = 'grabbing';
        }

    }, true);

    container_minimizer.addEventListener('click', () => {
        if (controls_visible) {
            voice_controls.style.display = 'none';
            container_minimizer.style.transform = 'rotate(180deg)';
            
            
        } else {
            voice_controls.style.display = 'flex';
            container_minimizer.style.transform = 'rotate(0deg)';
        }

        controls_visible = !controls_visible;
    });


    return controls_container;
}

const get_move_from_form = async () => {

    const move_input_form = document.getElementById('controls-move-form')

    const move_input = move_input_form.move_value.value;

    /* Empty the input field */
    move_input_form.move_value.value = '';


    return move_input;
}

export {
    inject_dashboard,
    add_container_movement,
    get_move_from_form
}