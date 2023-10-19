# Chess Visual Helper

To get this set up on your machine, follow these steps:
1. Download or open [Chrome](https://www.google.com/chrome/). <br>The extension has been migrated to Chrome due to the larger amount of resources available, as well as the higher number of users.

1. Download this codebase onto your device with:<br> `git clone https://github.com/enigmatic-bacon/YoutubeExtension.git` or similar.

2. Ensure that you have a functional version of npm `npm --version` [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

3. Open a terminal to the downloaded folder, and run `npm i`. This should install all dev-dependencies.

4. Run `npm run build` (or `npm run watch` if actively developing) to build the JS Webpack Bundle.

5. In Chrome, enter `chrome://extensions` into the URL bar.

6. Enable `Developer Mode` in the top right corner of the extensions page.

7. On the top left, click on `Load unpacked` and select the folder that <b>contains</b> the `manifest.json` file.

8. Click on the puzzle piece on the top right of the browser and select the `pin` icon beside the Chess Visual Helper extension.

9. Navigate to Chess.com, sign in, and navigate to either a real (or computer) game. The extension should load in an interface beneath your name.

10. Have fun!
