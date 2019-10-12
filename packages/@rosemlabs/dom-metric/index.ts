// INFO
// document.defaultView.getComputedStyle - retrieve computed styles
// - values can be "auto"
// clientWidth - padding-box
// offsetWidth - border-box
// scrollWidth - padding-box + hidden
// offsetLeft = position left+margin from the first positioned parent left edge
// clientLeft = left border + left scrollbar width (if present). (block level elements -only!)
// Element.getBoundingClientRect() - bounding border-box
// - related to viewport
// - includes transforms

// todo
// - viewportBox - //
// - visualViewportBox - //
// - screenBox - //
// - textBox -> rowCount [selectionBox]
// - contentBox  - DOMPosition & DOMSizeBox
// - paddingBox  - DOMPosition & DOMSizeBox & DOMEdgeBox
// - scrollBox   - DOMPosition & DOMSizeBox
// - boundingBox - DOMPosition & DOMSizeBox [overflowBox]
// - borderBox   - DOMPosition & DOMSizeBox & DOMEdgeBox
// - marginBox   -               DOMSizeBox & DOMEdgeBox
// - transformBox -

import { getGlobalOf } from '@rosemlabs/env'
import { getStyleNumericValue } from '@rosemlabs/dom-util'

export const TOP = 'top'
export const RIGHT = 'right'
export const BOTTOM = 'bottom'
export const LEFT = 'left'
export const WIDTH = 'width'
export const HEIGHT = 'height'
export const BORDER = 'border'
export const PADDING = 'padding'
export const BORDER_TOP = `${BORDER}-${TOP}`
export const BORDER_RIGHT = `${BORDER}-${RIGHT}`
export const BORDER_BOTTOM = `${BORDER}-${BOTTOM}`
export const BORDER_LEFT = `${BORDER}-${LEFT}`
export const PADDING_TOP = `${PADDING}-${TOP}`
export const PADDING_RIGHT = `${PADDING}-${RIGHT}`
export const PADDING_BOTTOM = `${PADDING}-${BOTTOM}`
export const PADDING_LEFT = `${PADDING}-${LEFT}`

export function isContentBox(style: CSSStyleDeclaration): boolean {
  return style.boxSizing === 'content-box'
}

export function isBorderBox(style: CSSStyleDeclaration): boolean {
  return style.boxSizing === 'border-box'
}

export function isScrollableX(style: CSSStyleDeclaration): boolean {
  return style.overflowX === 'scroll'
}

export function isScrollableY(style: CSSStyleDeclaration): boolean {
  return style.overflowY === 'scroll'
}

export function isScrollable(style: CSSStyleDeclaration): boolean {
  return isScrollableY(style) || isScrollableX(style)
}

export function getInlineBorder(style: CSSStyleDeclaration): number {
  return (
    getStyleNumericValue(style, BORDER_LEFT) +
    getStyleNumericValue(style, BORDER_RIGHT)
  )
}

export function getBlockBorder(style: CSSStyleDeclaration): number {
  return (
    getStyleNumericValue(style, BORDER_TOP) +
    getStyleNumericValue(style, BORDER_BOTTOM)
  )
}

export function getInlinePadding(style: CSSStyleDeclaration): number {
  return (
    getStyleNumericValue(style, PADDING_LEFT) +
    getStyleNumericValue(style, PADDING_RIGHT)
  )
}

export function getBlockPadding(style: CSSStyleDeclaration): number {
  return (
    getStyleNumericValue(style, PADDING_TOP) +
    getStyleNumericValue(style, PADDING_BOTTOM)
  )
}

export interface DOMPosition {
  readonly x: number
  readonly y: number
}

export interface DOMSizeBox {
  readonly width: number
  readonly height: number
}

export interface DOMPhysicalEdgeBox {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

export interface DOMLogicalEdgeBox {
  readonly inlineStart: number
  readonly inlineEnd: number
  readonly blockStart: number
  readonly blockEnd: number
}

export abstract class AbstractBox {
  protected target: HTMLElement
  protected _style?: CSSStyleDeclaration

  constructor(target: HTMLElement, style?: CSSStyleDeclaration) {
    this.target = target

    if (style) {
      this._style = style
    }
  }

  get computedStyle(): CSSStyleDeclaration {
    return (
      this._style ||
      (this._style = getGlobalOf(this.target).getComputedStyle(this.target))
    )
  }
}

export interface DOMEdgeBox extends DOMPhysicalEdgeBox, DOMLogicalEdgeBox {}

// export class DOMPaddingBox extends DOMContentBox {}

export default class DOMMetric {
  target: HTMLElement

  constructor(target: HTMLElement) {
    this.target = target
  }

  scrollbarXWidth() {}
  scrollbarYWidth() {}
}
