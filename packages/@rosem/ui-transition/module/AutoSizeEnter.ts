import {
  getInlinePaddingValue,
  getBlockPaddingValue,
  getBlockBorderValue,
  getInlineBorderValue,
} from '@rosem-util/dom-geometry'
import { Detail } from '../Module'
import AutoSize from './AutoSize'

const contentBoxSubtractSizeMap = {
  offsetWidth: (style: CSSStyleDeclaration) =>
    getInlinePaddingValue(style) + getInlineBorderValue(style),
  offsetHeight: (style: CSSStyleDeclaration) =>
    getBlockPaddingValue(style) + getBlockBorderValue(style),
}

export default class AutoSizeEnter extends AutoSize {
  beforeStart(detail: Detail): void {
    if (!detail.autoSizeCalculated) {
      // const isDisplayNone = detail.target.style.display === 'none'
      const isContentBox = detail.computedStyle.boxSizing === 'content-box'

      // detail.target.style.setProperty('display', '')
      this.propertyList.forEach((property) => {
        detail[property] = (detail.target as HTMLElement)[property] // todo

        if (isContentBox) {
          detail[property] -= contentBoxSubtractSizeMap[property](
            detail.computedStyle
          )
        }
      })

      detail.target.style.setProperty('display', 'none')
      detail.autoSizeCalculated = true
      detail.defferFrame()
    }
  }

  start(detail: Detail): void {
    this.sizeList.forEach(
      (size, index): void => {
        detail.target.style[size] = `${detail[this.propertyList[index]]}px`
      }
    )
  }

  afterEnd(detail: Detail): void {
    this.removeStyles(detail)
  }
}
