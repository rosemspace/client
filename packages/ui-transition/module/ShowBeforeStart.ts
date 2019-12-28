import Module from '../Module'
import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'

export type ShowBeforeStartDetail = {
  showBeforeStart: boolean
}

export default class ShowBeforeStart implements Module<ShowBeforeStartDetail> {
  beforeStart(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & ShowBeforeStartDetail
    >,
    next: () => void
  ): void {
    stageDispatcher.queueMutationTask('remove display none', (): void => {
      stageDispatcher.target.style.setProperty('display', '')
    })
    next()
  }

  getDetail(): ShowBeforeStartDetail {
    return {
      showBeforeStart: true,
    }
  }
}
