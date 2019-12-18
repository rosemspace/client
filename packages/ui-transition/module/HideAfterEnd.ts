import { AbstractModule, Detail } from '../Module'

export type HideAfterEndDetail = {
  hideAfterEnd: boolean
}

export default class HideAfterEnd extends AbstractModule {
  afterEnd(detail: Detail, next: () => void): void {
    this.mutate(() => {
      detail.target.style.setProperty('display', 'none')
    })
    next()
  }

  getDetail(): HideAfterEndDetail {
    return {
      hideAfterEnd: true,
    }
  }
}
