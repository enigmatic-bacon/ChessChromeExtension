
/* Track the movement of the controls container */
var mouse_down = false;
var controls_visible = true;

/* Inject the controls container into the page */
const inject_board_html = async (): Promise<void> => {

    /* Hacky way of getting the controls container HTML (ty Chrome). */
    const container_html: string = await (
        await fetch(
            chrome.runtime.getURL('/html/controls.html')
        )
    ).text().then(text => text.trim());

    /* Create a dummy container to hold the controls container */
    const container: HTMLElement = document.createElement('div');
    container.innerHTML = container_html;

    /* Append only the controls container to the main area of the page */
    const board_layout_main: HTMLElement = document.getElementById('board-layout-main');
    board_layout_main.appendChild(container.firstChild);

    /* Set the icons for the controls container */
    const container_mover: HTMLElement = document.getElementById('container-move-icon');
    const container_minimizer: HTMLElement = document.getElementById('container-drop-icon');

    (container_mover as HTMLImageElement).src = chrome.runtime.getURL('/icons/move-icon.png');
    (container_minimizer as HTMLImageElement).src = chrome.runtime.getURL('/icons/drop-icon.png');

    /* Remove the sidebar ad, why not? */
    document.getElementById('sidebar-ad').remove();
}

/* Add movement to the controls container */
const add_container_movement = (): Promise<void> => {

    const container_mover: HTMLElement = document.getElementById('voice-container-mover');
    const container_minimizer: HTMLElement = document.getElementById('voice-container-minimizer');

    _initialize_mover_functions(container_mover);
    _initialize_minimizer_functions(container_minimizer);

    return;
}

const get_move_from_form = (): string => {

    const move_input_form: HTMLElement = document.getElementById('controls-move-input')

    const move_input = (move_input_form as HTMLInputElement).value;

    /* Empty the input field */
    (move_input_form as HTMLInputElement).value = '';

    return move_input;
}

const inject_dashboard = async (): Promise<void> => {
    await inject_board_html();

    add_container_movement();

    return;
}

const _initialize_mover_functions = (mover: HTMLElement): void => {

    const controls_container: HTMLElement = document.getElementById('voice-container');

    mover.addEventListener('mousedown', () => {
        mouse_down = true;
    }, true);

    document.addEventListener('mouseup', () => {
        mouse_down = false;
        mover.style.cursor = 'grab';
    }, true);

    document.addEventListener('mousemove', (e) => {
        e.preventDefault();

        /* Handle moving the controls container */
        if (mouse_down) {
            controls_container.style.position = 'fixed';

            var deltaX: number = e.clientX;
            var deltaY: number = e.clientY;
            
            var rect: DOMRect = controls_container.getBoundingClientRect();

            controls_container.style.left = deltaX - rect.width + 20 + 'px';
            controls_container.style.top  = deltaY - 32 + 'px';
            mover.style.cursor = 'grabbing';
        }

    }, true);

    return;
}

const _initialize_minimizer_functions = (minimizer: HTMLElement): void => {

    const voice_controls: HTMLElement = document.getElementById('voice-controls');

    minimizer.addEventListener('click', () => {
        if (controls_visible) {
            minimizer.style.transform = 'rotate(180deg)';
        } else {
            minimizer.style.transform = 'rotate(0deg)';
        }

        voice_controls.classList.toggle('closed-controls');
        controls_visible = !controls_visible;
    });

    return;
}

export {
    inject_dashboard,
    get_move_from_form
}