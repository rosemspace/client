import { Detail } from '../Module'
import AutoSize from './AutoSize'

export default class AutoSizeLeave extends AutoSize {
  beforeStart(detail: Detail): void {
    this.propertyList.forEach((property, index) => {
      detail.target.style.setProperty(
        this.sizeList[index],
        `${(detail[property] = (detail.target as HTMLElement)[property])}px` //todo
      )
    })
  }

  start(detail: Detail): void {
    this.removeStyles(detail)
  }
}
