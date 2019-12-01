/**
 * Extra fields for a file from Electron.
 *
 * @typedef {Object} ElectronFileFields
 *
 * @prop {string} path
 *   Path to the file.
 */

/**
 * File from Electron.
 *
 * @typedef {File & ElectronFileFields} ElectronFile
 */

/**
 * Sublur file object fields.
 *
 * @typedef {Object} SublurSubject
 *
 * @prop {ElectronFile} file
 *   The file object.
 * @prop {OffscreenCanvas} canvasImage
 *   The canvas element of the image.
 */

/**
 * Creates DOM elements for an image file.
 *
 * @param {ElectronFile} file
 *   The file.
 *
 * @return {Promise<OffscreenCanvas>}
 *   The file object enriched with a canvas DOM element.
 */
async function createCanvas(file) {
  const image = new Image();
  const loaded = new Promise((resolve) => {
    image.onload = resolve;
  });

  image.src = file.path;

  await loaded;

  const canvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
  const ctx = /** @type {OffscreenCanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.drawImage(image, 0, 0);

  return canvas;
}

/**
 * Initializes the image loader.
 *
 * @param {import('../app').App} app
 *   The app to initialize on.
 */
module.exports = function init(app) {
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const jpgs = Array.from(event.dataTransfer.files)
        .filter(({ name }) => name.endsWith('.jpg'))
        .map(async (file) => ({
          file,
          canvasImage: await createCanvas(file),
        }));
      app.fire('filedrop', await Promise.all(jpgs));
    }
  });

  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
};
