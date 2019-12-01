/**
 * Sublur file
 *
 * @typedef {import('./image-loader').SublurSubject} SublurSubject
 */

/**
 * Coordinates.
 *
 * @typedef {Object} Coordinates
 *
 * @prop {number} x
 *   Cartesian x coordinate.
 * @prop {number} y
 *   Cartesian y coordinate.
 */

/**
 * Resets canvas image to default.
 *
 * @param {HTMLCanvasElement} canvas
 *   The canvas to reset.
 * @param {SublurSubject} file
 *   The file to reset to.
 */
function resetCanvas(canvas, file) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(file.canvasImage, 0, 0);
}

const lassoPattern = new OffscreenCanvas(10, 10);
{
  const lassoPatternCtx = /** @type {OffscreenCanvasRenderingContext2D} */ (lassoPattern.getContext('2d'));
  lassoPatternCtx.fillStyle = 'white';
  lassoPatternCtx.fillRect(0, 0, 5, 5);
  lassoPatternCtx.fillRect(5, 5, 5, 5);
  lassoPatternCtx.fillStyle = 'black';
  lassoPatternCtx.fillRect(5, 0, 5, 5);
  lassoPatternCtx.fillRect(0, 5, 5, 5);
}

/**
 * Draws a dotted selection lasso.
 *
 * @param {HTMLCanvasElement} canvas
 *   The canvas to draw on.
 * @param {SublurSubject} file
 *   The file this canvas represents.
 * @param {Coordinates} from
 *   Top left corner.
 * @param {Coordinates} to
 *   Top right corner.
 */
function drawLasso(canvas, file, from, to) {
  resetCanvas(canvas, file);

  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.strokeStyle = /** @type {CanvasPattern} */ (ctx.createPattern(lassoPattern, 'repeat'));
  ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
}

/**
 * Pixel-blurs a region of a canvas.
 *
 * @param {HTMLCanvasElement} canvas
 *   The canvas to blur.
 * @param {SublurSubject} file
 *   The file this canvas represents.
 * @param {Coordinates} from
 *   Top left corner.
 * @param {Coordinates} to
 *   Top right corner.
 */
function blurCanvas(canvas, file, from, to) {
  resetCanvas(canvas, file);

  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);

  const width = Math.abs(to.x - from.x);
  const height = Math.abs(to.y - from.y);

  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.filter = 'blur(5px)';
  ctx.drawImage(file.canvasImage, 0, 0);

  ctx.restore();
}

/**
 * Initializes the drawing.
 *
 * @param {import('../app').App} app
 *   The app to initialize on.
 */
module.exports = function init(app) {
  const list = /** @type {HTMLUListElement} */ (document.querySelector('.list'));

  /** @type {HTMLCanvasElement|null} */
  let activeCanvas;
  /** @type {SublurSubject|null} */
  let activeFile;
  /** @type {Coordinates} */
  let origin = { x: 0, y: 0 };
  /** @type {Coordinates} */
  let to = { x: 0, y: 0 };

  list.addEventListener('contextmenu', ({ srcElement }) => {
    if (!(srcElement instanceof HTMLCanvasElement)) return;
    delete srcElement.dataset.dirty; // eslint-disable-line no-param-reassign

    const file = app.getFiles().get(srcElement);
    if (file) resetCanvas(srcElement, file);
  });

  list.addEventListener('mousedown', ({ srcElement, offsetX, offsetY, button }) => {
    if (!(srcElement instanceof HTMLCanvasElement) || button !== 0) return;

    const file = app.getFiles().get(srcElement);
    if (file) {
      resetCanvas(srcElement, file);

      activeCanvas = srcElement;
      activeFile = file;
      origin = { x: offsetX, y: offsetY };
      to = { x: offsetX, y: offsetY };
    }
  });

  list.addEventListener('mousemove', ({ srcElement, offsetX, offsetY }) => {
    if (activeCanvas && activeCanvas === srcElement && activeFile) {
      to = { x: offsetX, y: offsetY };
      drawLasso(activeCanvas, activeFile, origin, to);
    }
  });

  list.addEventListener('mouseup', ({ srcElement, offsetX, offsetY }) => {
    if (activeCanvas && activeFile) {
      if (activeCanvas === srcElement) {
        to = { x: offsetX, y: offsetY };
      }

      blurCanvas(activeCanvas, activeFile, origin, to);
      activeCanvas.dataset.dirty = 'true'; // eslint-disable-line no-param-reassign

      activeCanvas = null;
      activeFile = null;
    }
  });
};
