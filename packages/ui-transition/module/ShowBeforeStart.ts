import { AbstractModule, Detail } from '../Module'

export type ShowBeforeStartDetail = {
  showBeforeStart: boolean
}

export default class ShowBeforeStart extends AbstractModule {
  beforeStart(detail: Detail, next: () => void): void {
    this.mutate(() => {
      detail.target.style.setProperty('display', '')
    })
    next()
  }

  getDetail(): ShowBeforeStartDetail {
    return {
      showBeforeStart: true,
    }
  }
}
