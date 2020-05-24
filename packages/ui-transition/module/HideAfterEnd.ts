import Module from '../Module'
import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'

export type HideAfterEndDetail = {
  hideAfterEnd: boolean
}

export default class HideAfterEnd implements Module<HideAfterEndDetail> {
  afterEnd(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & HideAfterEndDetail
    >,
    next: () => void
  ): void {
    stageDispatcher.queueMutationTask((): void => {
      // debugger
      // setTimeout(() => {
      // stageDispatcher.target.style.setProperty('display', 'none')
      stageDispatcher.target.style.display = 'none'
      // }, 1000)
    })
    next()
  }

  getDetail(): HideAfterEndDetail {
    return {
      hideAfterEnd: true,
    }
  }
}
