/**
 * Sublur file
 *
 * @typedef {import('./image-loader').SublurSubject} SublurSubject
 */

/**
 * Attaches images to the DOM.
 *
 * @param {HTMLUListElement} ul
 *   The list.
 *
 * @return {(file: SublurSubject) => [HTMLCanvasElement, SublurSubject]}
 *   Mapping entry function for a file.
 */
const createImage = (ul) => (file) => {
  const li = document.createElement('li');
  li.classList.add('list__item');

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  li.appendChild(canvas);
  ul.appendChild(li);

  canvas.width = file.canvasImage.width;
  canvas.height = file.canvasImage.height;

  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.drawImage(file.canvasImage, 0, 0);
  return [canvas, file];
};

/**
 * Initializes the listings.
 *
 * @param {import('../app').App} app
 *   The app to initialize on.
 */
module.exports = function init(app) {
  const list = /** @type {HTMLUListElement} */ (document.querySelector('.list'));

  app.on('filedrop', async (/** @type {SublurSubject[]} */ files) => {
    list.innerHTML = '';
    app.setFiles(new Map(files.map(createImage(list))));
  });
};
