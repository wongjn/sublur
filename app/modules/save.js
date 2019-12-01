const fs = require('fs').promises;

/**
 * Initializes the listings.
 *
 * @param {import('../app').App} app
 *   The app to initialize on.
 */
module.exports = function init(app) {
  const button = /** @type {HTMLButtonElement} */ (document.querySelector('button'));
  const output = /** @type {HTMLOutputElement} */ (document.querySelector('output'));

  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    output.innerText = 'Working ⌛';

    const saving = Array.from(app.getFiles().entries())
      .filter(([canvas]) => 'dirty' in canvas.dataset)
      .map(async ([canvas, { file }]) => {
        const url = canvas
          .toDataURL('image/jpg', 0.8)
          .replace(/^data:image\/png;base64,/, '');

        try {
          await fs.writeFile(file.path, url, 'base64');
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
        }
      });

    await Promise.all(saving);
    output.innerText = 'Done ✔';
  });
};
