import getGlobalOf from '@rosem-util/env/getGlobalOf'

/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
export default // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
// interface.
(null != SVGGraphicsElement
  ? (target: Element): boolean =>
      target instanceof getGlobalOf(target).SVGGraphicsElement
  : // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    (target: SVGGraphicsElement): boolean =>
      target instanceof getGlobalOf(target).SVGElement &&
      typeof target.getBBox === 'function')
