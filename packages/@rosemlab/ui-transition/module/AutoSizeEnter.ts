import { DOMSizeBox } from '@rosemlab/dom-metric'
import DOMBoundingBox from '@rosemlab/dom-metric/DOMBoundingBox'
import DOMScheduler from '@rosemlab/dom-scheduler'
import { Detail } from '../Module'
import AutoSize from './AutoSize'

export default class AutoSizeEnter extends AutoSize {
  beforeStart(detail: Detail, next: () => void): void {
    // super.beforeStart(detail, next)

    const { target } = detail

    if (detail.autoSizeCalculated) {
      this.sizeList.forEach((size: keyof DOMSizeBox) => {
        detail.taskList = [
          DOMScheduler.mutate(() => {
            target.style.setProperty(size, '')
          }),
        ]
      })
      // detail.taskList.push(DOMScheduler.mutate(() => {
      super.beforeStart(detail, next)
      console.log('BEFORE START 2')
      // }))
    } else {
      const metric = DOMBoundingBox.from(
        target as HTMLElement,
        detail.computedStyle
      )

      detail.taskList = [
        DOMScheduler.mutate(() => {
          this.sizeList.forEach((size: string) => {
            target.style.setProperty(size, 'auto')
          })

          // We need separated cycle to do not trigger reflow multiple times
          this.sizeList.forEach((size: keyof DOMSizeBox) => {
            // We need to run reflow to get end values for transition
            detail[size] = metric[size]
            detail.taskList.push(
              DOMScheduler.mutate(() => {
                target.style.setProperty(size, '')
              })
            )
          })
          detail.autoSizeCalculated = true
          console.log(true)
          // detail.taskList.push(DOMScheduler.mutate(() => {
          super.beforeStart(detail, next)
          console.log('BEFORE START 1')
          // }))
        }),
      ]
    }
  }

  start(detail: Detail, next: () => void): void {
    console.log('START')
    const { target } = detail

    // DOM write
    detail.taskList.push(
      DOMScheduler.mutate(() => {
        this.sizeList.forEach((size: keyof DOMSizeBox) => {
          target.style.setProperty(size, `${detail[size]}px`)
        })
      })
    )
    super.start(detail, next)
  }

  afterEnd(detail: Detail, next: () => void): void {
    const { target } = detail

    detail.taskList.push(
      DOMScheduler.mutate(() => {
        // detail.taskList.push(DOMScheduler.mutate(() => {
        this.sizeList.forEach((property) => {
          target.style.setProperty(property, '')
        })
        detail.autoSizeCalculated = false
        // }))
      })
    )
    super.afterEnd(detail, next)
    // this.removeStyles(detail)
  }
}
