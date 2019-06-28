import DOMScheduler from '@rosemlab/dom-scheduler'
import { Detail } from '../Module'
import Delegate from './Delegate'

export type Size = 'width' | 'height'
export type SizeProperty = 'offsetWidth' | 'offsetHeight'

export const sizeMap: Record<Size, SizeProperty> = {
  width: 'offsetWidth',
  height: 'offsetHeight',
}

export default abstract class AutoSize extends Delegate {
  protected readonly sizeList: Size[]
  protected readonly propertyList: SizeProperty[]

  constructor(sizeList: Size[] = ['height']) {
    super()
    this.sizeList = sizeList
    this.propertyList = sizeList.map((size) => sizeMap[size])
  }

  protected removeStyles(detail: Detail): void {
    const { target } = detail

    detail.taskList.push(
      DOMScheduler.mutate(() => {
        this.sizeList.forEach((property) => {
          target.style.setProperty(property, '')
        })
      })
    )
  }

  cancelled(detail: Detail, next: () => void): void {
    detail.taskList.forEach((task: Function) => DOMScheduler.clear(task))
    super.cancelled(detail, next)
  }

  getDetail(): Partial<Detail> {
    return {
      autoSize: true,
      autoSizePropertyList: this.propertyList,
    }
  }
}
