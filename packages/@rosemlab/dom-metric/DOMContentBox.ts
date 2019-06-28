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
  isScrollableY,
  PADDING_LEFT,
  PADDING_TOP,
  WIDTH,
} from './index'

export default class DOMContentBox extends AbstractBox
  implements DOMPosition, DOMSizeBox {
  static from(target: HTMLElement, style?: CSSStyleDeclaration): DOMContentBox {
    return new DOMContentBox(target, style)
  }

  get x(): number {
    return (
      this.target.offsetLeft +
      this.target.clientLeft +
      getStyleNumericValue(this.computedStyle, PADDING_LEFT)
    )
  }

  get y(): number {
    return (
      this.target.offsetTop +
      this.target.clientTop +
      getStyleNumericValue(this.computedStyle, PADDING_TOP)
    )
  }

  get width(): number {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    const { clientWidth } = this.target

    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth) {
      return 0
    }

    const style: CSSStyleDeclaration = this.computedStyle

    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (isBorderBox(style)) {
      let width: number

      if (isScrollableY(style)) {
        const boxSizingInlineStyle: string = this.target.style.boxSizing || ''

        this.target.style.boxSizing = 'content-box'
        // Computed styles of width & height are being used because they are the
        // only dimensions available to JS that contain non-rounded values. It could
        // be possible to utilize the getBoundingClientRect if only it's data wasn't
        // affected by CSS transformations let alone paddings, borders and scroll bars.
        // Reflow
        width = getStyleNumericValue(style, WIDTH)
        console.warn(
          'Performance bottleneck: layout thrashing is triggered.' +
            ' Please avoid using content box with CSS "box-sizing: border-box" and "overflow-y: scroll"'
        )

        this.target.style.boxSizing = boxSizingInlineStyle
      } else {
        width = getStyleNumericValue(style, WIDTH)
      }

      const inlinePadding: number = getInlinePadding(style)
      // Following conditions are required to handle Internet Explorer which
      // doesn't include paddings and borders to computed CSS dimensions.
      //
      // We can say that if CSS dimensions + paddings are equal to the "client"
      // properties then it's either IE, and thus we don't need to subtract
      // anything, or an element merely doesn't have paddings/borders styles.
      if (Math.round(width + inlinePadding) !== clientWidth) {
        width -= getInlineBorder(style) + inlinePadding
      }

      return width
    }

    return getStyleNumericValue(style, WIDTH)
  }

  get height(): number {
    const { clientHeight } = this.target

    if (!clientHeight) {
      return 0
    }

    const style: CSSStyleDeclaration = this.computedStyle

    if (isBorderBox(style)) {
      let height: number

      if (isScrollableY(style)) {
        const boxSizingInlineStyle: string = this.target.style.boxSizing || ''

        this.target.style.boxSizing = 'content-box'
        // Reflow
        height = getStyleNumericValue(style, HEIGHT)
        console.warn(
          'Performance bottleneck: layout thrashing is triggered.' +
            ' Please avoid using content box with CSS "box-sizing: border-box" and "overflow-x: scroll"'
        )

        this.target.style.boxSizing = boxSizingInlineStyle
      } else {
        height = getStyleNumericValue(style, HEIGHT)
      }

      const blockPadding: number = getBlockPadding(style)

      if (Math.round(height + blockPadding) !== clientHeight) {
        height -= getBlockBorder(style) + blockPadding
      }

      return height
    }

    return getStyleNumericValue(style, HEIGHT)
  }
}
