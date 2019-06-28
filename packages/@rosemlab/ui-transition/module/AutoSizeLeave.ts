import { DOMSizeBox } from '@rosemlab/dom-metric'
import DOMBoundingBox from '@rosemlab/dom-metric/DOMBoundingBox'
import DOMScheduler from '@rosemlab/dom-scheduler'
import { Detail } from '../Module'
import AutoSize from './AutoSize'

export default class AutoSizeLeave extends AutoSize {
  beforeStart(detail: Detail, next: () => void): void {
    super.beforeStart(detail, next)

    const metric = DOMBoundingBox.from(
      detail.target as HTMLElement,
      detail.computedStyle
    )

    detail.taskList = [
      DOMScheduler.mutate(() => {
        this.sizeList.forEach((size: keyof DOMSizeBox) => {
          detail.target.style.setProperty(
            size,
            `${metric[size]}px` //todo
          )
        })
        // Tell AutoSizeEnter module to do not recalculate metrics
        // detail.autoSizeCalculated = true
      }),
    ]
  }

  start(detail: Detail, next: () => void): void {
    const { target } = detail

    detail.taskList.push(
      DOMScheduler.mutate(() => {
        // detail.taskList.push(DOMScheduler.mutate(() => {
        this.sizeList.forEach((property) => {
          target.style.setProperty(property, '')
        })
        // }))
      })
    )
    // this.removeStyles(detail)
    super.start(detail, next)
  }
}
