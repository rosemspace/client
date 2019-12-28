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
    stageDispatcher.queueMutationTask('set display none', (): void => {
      stageDispatcher.target.style.setProperty('display', 'none')
    })
    next()
  }

  getDetail(): HideAfterEndDetail {
    return {
      hideAfterEnd: true,
    }
  }
}
