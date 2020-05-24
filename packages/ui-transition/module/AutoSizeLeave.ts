import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'
import AutoSize, {
  AutoSizeDetail,
  Size,
  SIZE_INDEX_SCROLL_SIZE_MAP,
} from './AutoSize'

export default class AutoSizeLeave extends AutoSize {
  beforeStageChange(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    if (!stageDispatcher.running) {
      // stageDispatcher.queueMeasureTask(
      //   'AutoSizeLeave BeforeStart measure',
      //   (): void => {
      //     this.sizeList.forEach((size: Size) => {
      //       stageDispatcher.detail[size] =
      //         stageDispatcher.target[SIZE_INDEX_SCROLL_SIZE_MAP[size]]
      //     })
      //   }
      // )
    }
    next()
  }

  beforeStart(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    if (!stageDispatcher.running) {
      stageDispatcher.queueMeasureTask((): void => {
        this.sizeList.forEach((size: Size): void => {
          stageDispatcher.detail[size] =
            stageDispatcher.target[SIZE_INDEX_SCROLL_SIZE_MAP[size]]
        })
      })
      stageDispatcher.queueMutationTask((): void => {
        stageDispatcher.target.style.setProperty('box-sizing', 'border-box')
        this.sizeList.forEach((size: Size) => {
          stageDispatcher.target.style.setProperty(
            size,
            `${stageDispatcher.detail[size]}px`
          )
        })
      })
    }

    next()
  }

  start(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    stageDispatcher.queueMutationTask((): void => {
      this.removeSizeStyles(stageDispatcher.target)
    })
    next()
  }

  afterEnd(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & AutoSizeDetail>,
    next: () => void
  ): void {
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.style.setProperty('box-sizing', '')
    })
    next()
  }
}
