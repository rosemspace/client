import defineConfigurableProperties from '@rosem/common-util/defineConfigurableProperties'
import inBrowser from '@rosem/env/inBrowser'
import getGlobalOf from '@rosem/env/getGlobalOf'
import isDocumentElement from '@rosem/dom-util/isDocumentElement'
import isSVGGraphicsElement from '@rosem/dom-util/isSVGGraphicsElement'

type PositionName = 'top' | 'right' | 'bottom' | 'left'
type EdgeName = 'inlineStart' | 'inlineEnd' | 'blockStart' | 'blockEnd'
// type PositionNameList = PositionName[]
type EdgeNameList = EdgeName[]
type EdgeNameToPositionNameMap = { [edge in EdgeName]: PositionName }
type DOMEdgeType = 'content' | 'padding' | 'border' | 'margin'
type DOMEdge = { [edge in EdgeName]: number }

// const positionNameList: PositionNameList = ['top', 'right', 'bottom', 'left']
const edgeNameList: EdgeNameList = [
  'inlineStart',
  'inlineEnd',
  'blockStart',
  'blockEnd',
]
const edgeNameToPositionNameMap: EdgeNameToPositionNameMap = {
  inlineStart: 'left',
  inlineEnd: 'right',
  blockStart: 'top',
  blockEnd: 'bottom',
}
// Placeholder of an empty content rectangle.
const emptyRectInit = createRectInit(0, 0, 0, 0)

/**
 * Converts provided string to a number.
 *
 * @param {string|number|null} [value]
 * @returns {number}
 */
function toFloat(value?: string | number | null): number {
  return (null != value ? parseFloat(String(value)) : 0) || 0
}

/**
 * Extracts size from provided styles.
 *
 * @param {string} name
 * @param {CSSStyleDeclaration} styles
 * @param {...string} edgeNameList - Border edge (inline-start, block-end, ...)
 * @returns {number}
 */
export function getEdgeSum(
  name: string,
  styles: CSSStyleDeclaration,
  ...edgeNameList: EdgeNameList
): number {
  return edgeNameList.reduce((size: number, edgeName: EdgeName): number => {
    const value: string = styles.getPropertyValue(
      `${name}-${edgeNameToPositionNameMap[edgeName]}`
    )

    return size + toFloat(value)
  }, 0)
}

/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} edgeNameList - Border edge (inline-start, block-end, ...)
 * @returns {number}
 */
export function getBorderSum(
  styles: CSSStyleDeclaration,
  ...edgeNameList: EdgeNameList
): number {
  return edgeNameList.reduce((size: number, edgeName: EdgeName): number => {
    const value: string = styles.getPropertyValue(
      'border-' + edgeNameToPositionNameMap[edgeName] + '-width'
    )

    return size + toFloat(value)
  }, 0)
}

export function getInlineBorderValue(style: CSSStyleDeclaration) {
  return getBorderSum(style, 'inlineStart', 'inlineEnd')
}

export function getBlockBorderValue(style: CSSStyleDeclaration) {
  return getBorderSum(style, 'blockStart', 'blockEnd')
}

export function getPaddingSum(
  styles: CSSStyleDeclaration,
  ...edgeNameList: EdgeNameList
) {
  return getEdgeSum('padding', styles, ...edgeNameList)
}

export function getInlinePaddingValue(styles: CSSStyleDeclaration) {
  return getPaddingSum(styles, 'inlineStart', 'inlineEnd')
}

export function getBlockPaddingValue(styles: CSSStyleDeclaration) {
  return getPaddingSum(styles, 'blockStart', 'blockEnd')
}

/**
 * Extracts padding sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Padding box.
 */
export function getPaddingEdge(styles: CSSStyleDeclaration): DOMEdge {
  const paddingEdge: DOMEdge = {} as DOMEdge

  for (const edgeName of edgeNameList) {
    paddingEdge[edgeName] = toFloat(
      styles.getPropertyValue('padding-' + edgeNameToPositionNameMap[edgeName])
    )
  }

  return paddingEdge
}

/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGGraphicsElementContentRect(
  target: SVGGraphicsElement
): DOMRectInit {
  const bbox: DOMRect = target.getBBox()

  return createRectInit(0, 0, bbox.width, bbox.height)
}

/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content
 *   rectangle.
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
    return emptyRectInit
  }

  const styles: CSSStyleDeclaration = getGlobalOf(target).getComputedStyle(
    target
  )
  const paddingEdge: DOMEdge = getPaddingEdge(styles)
  const inlinePadding: number = paddingEdge.inlineStart + paddingEdge.inlineEnd
  const blockPadding: number = paddingEdge.blockStart + paddingEdge.blockEnd

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
    if (Math.round(width + inlinePadding) !== clientWidth) {
      width -= getBorderSum(styles, 'inlineStart', 'inlineEnd') + inlinePadding
    }

    if (Math.round(height + blockPadding) !== clientHeight) {
      height -= getBorderSum(styles, 'blockStart', 'blockEnd') + blockPadding
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
    const blockScrollbar: number =
      Math.round(width + inlinePadding) - clientWidth
    const inlineScrollbar: number =
      Math.round(height + blockPadding) - clientHeight

    // Chrome has a rather weird rounding of "client" properties.
    // E.g. for an element with content width of 314.2px it sometimes gives
    // the client width of 315px and for the width of 314.7px it may give
    // 314px. And it doesn't happen all the time. So just ignore this delta
    // as a non-relevant.
    if (Math.abs(blockScrollbar) !== 1) {
      width -= blockScrollbar
    }

    if (Math.abs(inlineScrollbar) !== 1) {
      height -= inlineScrollbar
    }
  }

  return createRectInit(
    paddingEdge.inlineStart,
    paddingEdge.blockStart,
    width,
    height
  )
}

/**
 * Calculates an appropriate content rectangle for provided html or svg
 * element.
 *
 * @param {HTMLElement|SVGGraphicsElement} target - Element content rectangle
 *   of which needs to be calculated.
 * @returns {DOMRectInit}
 */
export function getElementContentRect(target: Element): DOMRectInit {
  if (!inBrowser) {
    return emptyRectInit
  }

  if (isSVGGraphicsElement(target as SVGGraphicsElement)) {
    return getSVGGraphicsElementContentRect(target as SVGGraphicsElement)
  }

  return getHTMLElementContentRect(target as HTMLElement)
}

/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and
 *   dimensions.
 * @returns {DOMRectReadOnly}
 */
export function createRectReadOnly({
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
 * Creates DOMRectInit object based on the provided dimensions and the x/y
 * coordinates. Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
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
