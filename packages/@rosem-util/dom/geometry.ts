import inBrowser from '@rosem-util/env/inBrowser.js'
import getGlobalOf from '@rosem-util/env/getGlobalOf'
import defineConfigurableProperties from '@rosem-util/common/defineConfigurableProperties'

type Position = 'top' | 'right' | 'bottom' | 'left'
type PositionList = Position[]
type PaddingRect = { top: number; right: number; bottom: number; left: number }

const positions: PositionList = ['top', 'right', 'bottom', 'left']
// Placeholder of an empty content rectangle.
const emptyRect = createRectInit(0, 0, 0, 0)

/**
 * Converts provided string to a number.
 *
 * @param {string|number} value
 * @returns {number}
 */
function toFloat(value: string | null): number {
  return parseFloat(String(value)) || 0
}

/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize(
  styles: CSSStyleDeclaration,
  ...positions: PositionList
): number {
  return positions.reduce((size: number, position: Position): number => {
    const value: string = styles.getPropertyValue(
      'border-' + position + '-width'
    )

    return size + toFloat(value)
  }, 0)
}

/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles: CSSStyleDeclaration): PaddingRect {
  const paddingRect: PaddingRect = {} as PaddingRect

  for (const position of positions) {
    const value = styles.getPropertyValue('padding-' + position)

    paddingRect[position] = toFloat(value)
  }

  return paddingRect
}

/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target: SVGGraphicsElement): DOMRectInit {
  const bbox: DOMRect = target.getBBox()

  return createRectInit(0, 0, bbox.width, bbox.height)
}

/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target: HTMLElement): DOMRectInit {
  // Client width & height properties can't be
  // used exclusively as they provide rounded values.
  const { clientWidth, clientHeight } = target

  // By this condition we can catch all non-replaced inline, hidden and
  // detached elements. Though elements with width & height properties less
  // than 0.5 will be discarded as well.
  //
  // Without it we would need to implement separate methods for each of
  // those cases and it's not possible to perform a precise and performance
  // effective test for hidden elements. E.g. even jQuery's ':visible' filter
  // gives wrong results for elements with width & height less than 0.5.
  if (!clientWidth && !clientHeight) {
    return emptyRect
  }

  const styles: CSSStyleDeclaration = getGlobalOf(target).getComputedStyle(
    target
  )
  const paddingRect: PaddingRect = getPaddings(styles)
  const horizPad: number = paddingRect.left + paddingRect.right
  const vertPad: number = paddingRect.top + paddingRect.bottom

  // Computed styles of width & height are being used because they are the
  // only dimensions available to JS that contain non-rounded values. It could
  // be possible to utilize the getBoundingClientRect if only it's data wasn't
  // affected by CSS transformations let alone paddings, borders and scroll bars.
  let width: number = toFloat(styles.width)
  let height: number = toFloat(styles.height)

  // Width & height include paddings and borders when the 'border-box' box
  // model is applied (except for IE).
  if ('border-box' === styles.boxSizing) {
    // Following conditions are required to handle Internet Explorer which
    // doesn't include paddings and borders to computed CSS dimensions.
    //
    // We can say that if CSS dimensions + paddings are equal to the "client"
    // properties then it's either IE, and thus we don't need to subtract
    // anything, or an element merely doesn't have paddings/borders styles.
    if (Math.round(width + horizPad) !== clientWidth) {
      width -= getBordersSize(styles, 'left', 'right') + horizPad
    }

    if (Math.round(height + vertPad) !== clientHeight) {
      height -= getBordersSize(styles, 'top', 'bottom') + vertPad
    }
  }

  // Following steps can't be applied to the document's root element as its
  // client[Width/Height] properties represent viewport area of the window.
  // Besides, it's as well not necessary as the <html> itself neither has
  // rendered scroll bars nor it can be clipped.
  if (!isDocumentElement(target)) {
    // In some browsers (only in Firefox, actually) CSS width & height
    // include scroll bars size which can be removed at this step as scroll
    // bars are the only difference between rounded dimensions + paddings
    // and "client" properties, though that is not always true in Chrome.
    const vertScrollbar: number = Math.round(width + horizPad) - clientWidth
    const horizScrollbar: number = Math.round(height + vertPad) - clientHeight

    // Chrome has a rather weird rounding of "client" properties.
    // E.g. for an element with content width of 314.2px it sometimes gives
    // the client width of 315px and for the width of 314.7px it may give
    // 314px. And it doesn't happen all the time. So just ignore this delta
    // as a non-relevant.
    if (Math.abs(vertScrollbar) !== 1) {
      width -= vertScrollbar
    }

    if (Math.abs(horizScrollbar) !== 1) {
      height -= horizScrollbar
    }
  }

  return createRectInit(paddingRect.left, paddingRect.top, width, height)
}

/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
const isSVGGraphicsElement =
  // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
  // interface.
  null != SVGGraphicsElement
    ? (target: Element): boolean =>
        target instanceof getGlobalOf(target).SVGGraphicsElement
    : // If it's so, then check that element is at least an instance of the
      // SVGElement and that it has the "getBBox" method.
      // eslint-disable-next-line no-extra-parens
      (target: SVGGraphicsElement): boolean =>
        target instanceof getGlobalOf(target).SVGElement &&
        typeof target.getBBox === 'function'

/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target: Element): boolean {
  return target === getGlobalOf(target).document.documentElement
}

/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {HTMLElement|SVGGraphicsElement} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
export function getContentRect(target: Element): DOMRectInit {
  if (!inBrowser) {
    return emptyRect
  }

  if (isSVGGraphicsElement(target as SVGGraphicsElement)) {
    return getSVGContentRect(target as SVGGraphicsElement)
  }

  return getHTMLElementContentRect(target as HTMLElement)
}

/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
export function createReadOnlyRect({
  x,
  y,
  width,
  height,
}: DOMRectInit): DOMRectReadOnly {
  // If DOMRectReadOnly is available use it as a prototype for the rectangle.
  const Constr = null != DOMRectReadOnly ? DOMRectReadOnly : Object
  const rect = Object.create(Constr.prototype)

  // Rectangle's properties are not writable and non-enumerable.
  defineConfigurableProperties(rect, {
    x,
    y,
    width,
    height,
    top: y,
    right: null != x && null != width ? x + width : x || width,
    bottom: null != y && null != height ? height + y : y || height,
    left: x,
  })

  return rect
}

/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
export function createRectInit(
  x: number,
  y: number,
  width: number,
  height: number
): DOMRectInit {
  return { x, y, width, height }
}
