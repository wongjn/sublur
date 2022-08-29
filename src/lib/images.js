import { writable, get } from 'svelte/store';

/**
 * List of image file names that should have the blur at the top rather than
 * the bottom.
 *
 * @type {import('svelte/store').Writable<Set<string>>}
 */
export const tops = writable(new Set());

const WIDTH = 160;
const HEIGHT = 23;
const OFFSET_Y = 13;

const images = new Map();

/**
 * Create/get an image object from a file
 *
 * @param {File} file The file.
 * @return {Promise<HTMLImageElement>} The file as an image.
 */
const getImage = (file) =>
  new Promise((resolve) => {
    if (images.has(file)) {
      resolve(images.get(file));
    } else {
      const image = new Image();
      image.onload = () => {
        images.set(file, image);
        resolve(image);
      };
      image.src = URL.createObjectURL(file);
    }
  });

/**
 * Gets the parameters for a CanvasRenderingContext2D.rect() draw.
 *
 * @param {File} file The file to get parameters for.
 * @param {HTMLCanvasElement} canvas The canvas being drawn to.
 * @return {[number,number,number,number]} The parameters as an array.
 */
const getRectParameters = (file, canvas) => [
  (canvas.width - WIDTH) / 2,
  get(tops).has(file.name) ? OFFSET_Y : canvas.height - HEIGHT - OFFSET_Y,
  WIDTH,
  HEIGHT,
];

/**
 * Creates a blurred version of an image.
 *
 * @param {File} file File of the image to blur.
 * @return {Promise<Blob>} The blurred image as a blob.
 */
export const blur = async (file) => {
  const image = await getImage(file);
  const canvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);

  const ctx = /** @type {OffscreenCanvasRenderingContext2D} */ (
    canvas.getContext('2d')
  );
  ctx.drawImage(image, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(...getRectParameters(file, canvas));
  ctx.clip();
  ctx.filter = 'blur(5px)';
  ctx.drawImage(image, 0, 0);
  ctx.restore();

  return canvas.convertToBlob({ type: 'image/jpg', quality: 0.8 });
};

/**
 * Creates a preview version of an image.
 *
 * @param {File} file File of the image to preview.
 * @param {HTMLCanvasElement} canvas The canvas to draw the preview into.
 */
export const preview = async (file, canvas) => {
  const image = await getImage(file);

  /* eslint-disable no-param-reassign */
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  /* eslint-enable no-param-reassign */

  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.drawImage(image, 0, 0);

  ctx.strokeStyle = 'lime';
  ctx.strokeRect(...getRectParameters(file, canvas));
};
