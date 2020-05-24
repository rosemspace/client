import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'
import AutoSize, {
  AutoSizeDetail,
  Size,
  SIZE_INDEX_SCROLL_SIZE_MAP,
} from './AutoSize'

export default class AutoSizeEnter extends AutoSize {
  beforeStart(
    { detail }: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    if (!detail.running) {
      // detail.target.style.setProperty('box-sizing', 'content-box')
      // this.sizeList.forEach((size: Size) => {
      //   detail[size] = detail.target[SIZE_INDEX_SCROLL_SIZE_MAP[size]]
      // })
      // this.sizeList.forEach((size: Size) => {
      //   detail.target.style.setProperty(
      //     size,
      //     `${(detail[size] =
      //       detail.target[SIZE_INDEX_SCROLL_SIZE_MAP[size]])}px`
      //   )
      // })
    }

    next()
  }

  start(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    // if (!detail.running) {
    //   detail.target.style.setProperty('box-sizing', 'content-box')
    // }
    //
    // this.sizeList.forEach((size: Size) => {
    //   detail.target.style.setProperty(size, `${detail[size]}px`)
    // })
    if (stageDispatcher.running) {
      stageDispatcher.queueMutationTask((): void => {
        this.sizeList.forEach((size: Size) => {
          stageDispatcher.target.style.setProperty(
            size,
            `${stageDispatcher.detail[size]}px`
          )
        })
      })
    } else {
      stageDispatcher.queueMeasureTask((): void => {
        this.sizeList.forEach((size: Size) => {
          stageDispatcher.detail[size] =
            stageDispatcher.target[SIZE_INDEX_SCROLL_SIZE_MAP[size]]
        })
      })
      stageDispatcher.queueMutationTask((): void => {
        this.sizeList.forEach((size: Size) => {
          stageDispatcher.target.style.setProperty(
            size,
            `${stageDispatcher.detail[size]}px`
          )
        })
        stageDispatcher.target.style.setProperty('box-sizing', 'content-box')
      })
    }

    next()
  }

  afterEnd(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.style.setProperty('box-sizing', '')
      this.removeSizeStyles(stageDispatcher.target)
    })
    next()
  }
}
