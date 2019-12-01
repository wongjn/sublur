const { Color, Titlebar } = require('custom-electron-titlebar');
const imageLoader = require('./modules/image-loader');
const listing = require('./modules/listing');
const drawing = require('./modules/drawing');
const save = require('./modules/save');

// eslint-disable-next-line no-new
new Titlebar({ backgroundColor: Color.fromHex('#263238') });

/**
 * Sublur file
 *
 * @typedef {import('./modules/image-loader').SublurSubject} SublurSubject
 */

/**
 * The app object.
 *
 * @typedef {Object} App
 *
 * @prop {(eventName: string, listener: (detail: any) => void) => void} on
 *   Add an event listener.
 * @prop {(eventName: string, detail?: any) => void} fire
 *   Fire an event.
 * @prop {(files: Map<HTMLCanvasElement, SublurSubject>) => void} setFiles
 *   Set loaded files.
 * @prop {() => Map<HTMLCanvasElement, SublurSubject>} getFiles
 *   Gets loaded files.
 */

/**
 * Event bus for the app object.
 */
const eventBus = new EventTarget();

/**
 * Event bus for the app object.
 */
const state = {
  /**
   * Current set of loaded files.
   *
   * @type {Map<HTMLCanvasElement, SublurSubject>}
   */
  files: new Map(),
};

/** @type {App} */
const app = {
  on(eventName, listener) {
    eventBus.addEventListener(eventName, ({ detail }) => listener(detail));
  },
  fire(eventName, detail) {
    eventBus.dispatchEvent(new CustomEvent(eventName, { detail }));
  },
  setFiles(files) {
    state.files = files;
  },
  getFiles() {
    return state.files;
  },
};

imageLoader(app);
listing(app);
drawing(app);
save(app);
