/**
 * Detects whether window and document objects are available in current environment.
 */
export default null != window &&
  null != document &&
  window.document === document
