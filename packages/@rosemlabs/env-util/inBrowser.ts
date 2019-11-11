/**
 * Detects whether window and document objects are available in current environment.
 */
export default null != globalThis.window &&
  null != globalThis.document &&
  globalThis.window.document === globalThis.document
