import { getStyleNumericValue } from '@rosemlab/dom-util'
import {
  AbstractBox,
  DOMPosition,
  DOMSizeBox,
  getBlockBorder,
  getBlockPadding,
  getInlineBorder,
  getInlinePadding,
  HEIGHT,
  isBorderBox,
  isScrollableX,
  isScrollableY,
  WIDTH,
} from './index'

export default class DOMBoundingBox extends AbstractBox
  implements DOMPosition, DOMSizeBox {
  static from(
    target: HTMLElement,
    style?: CSSStyleDeclaration
  ): DOMBoundingBox {
    return new DOMBoundingBox(target, style)
  }

  get x(): number {
    return this.target.offsetLeft
  }

  get y(): number {
    return this.target.offsetTop
  }

  get width(): number {
    const { clientWidth } = this.target

    if (!clientWidth) {
      return 0
    }

    const style: CSSStyleDeclaration = this.computedStyle
    let width: number

    if (isBorderBox(style)) {
      width = getStyleNumericValue(style, WIDTH)

      if (Math.round(width + getInlinePadding(style)) !== clientWidth) {
        width -= getInlineBorder(style)
      }
    } else {
      if (isScrollableY(style)) {
        const overflowYInlineStyle: string = this.target.style.overflowY || ''

        this.target.style.overflowY = 'hidden'
        // Reflow
        width = getStyleNumericValue(style, WIDTH)
        console.warn(
          'Getting width is triggering layout thrashing.' +
            ' Please avoid using bounding box of element with CSS "box-sizing: ' +
            'content-box" and "overflow-y: scroll" to improve performance'
        )

        this.target.style.overflowY = overflowYInlineStyle
      } else {
        width = getStyleNumericValue(style, WIDTH)
      }

      return width + getInlinePadding(style)
    }

    return width
  }

  get height(): number {
    const { clientHeight } = this.target

    if (!clientHeight) {
      return 0
    }

    const style: CSSStyleDeclaration = this.computedStyle
    let height: number

    if (isBorderBox(style)) {
      height = getStyleNumericValue(style, HEIGHT)

      if (Math.round(height + getBlockPadding(style)) !== clientHeight) {
        height -= getBlockBorder(style)
      }
    } else {
      if (isScrollableX(style)) {
        const overflowXInlineStyle: string = this.target.style.overflowY || ''

        this.target.style.overflowX = 'hidden'
        // Reflow
        height = getStyleNumericValue(style, HEIGHT)
        console.warn(
          'Performance bottleneck: layout thrashing is triggered.' +
            ' Please avoid using bounding box with CSS "box-sizing: content-box" and "overflow-x: scroll"'
        )

        this.target.style.overflowX = overflowXInlineStyle
      } else {
        height = getStyleNumericValue(style, HEIGHT)
      }

      return height + getBlockPadding(style)
    }

    return height
  }
}
