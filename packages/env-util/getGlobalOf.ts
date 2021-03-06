/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
export default function getGlobalOf(target?: unknown): typeof globalThis {
  // Assume that the element is an instance of Node, which means that it
  // has the "ownerDocument" property from which we can retrieve a
  // corresponding global object.
  const ownerGlobal =
    target &&
    (((target as Node).ownerDocument &&
      (target as Node).ownerDocument!.defaultView) ||
      (target instanceof Document ? target.defaultView : undefined))

  // Return the local global object if it's not possible extract one from
  // provided element.
  return (ownerGlobal || globalThis) as typeof globalThis
}
