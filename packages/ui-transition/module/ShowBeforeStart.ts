import DOMScheduler from '@rosemlabs/dom-scheduler'
import { Detail } from '../Module'
import Delegate from './Delegate'

export default class ShowBeforeStart extends Delegate {
  beforeStart(detail: Detail, next: () => void): void {
    DOMScheduler.mutate(() => {
      detail.target.style.setProperty('display', '')
    })

    super.beforeStart(detail, next)
  }

  getDetail(): Partial<Detail> {
    return {
      showBeforeStart: true,
    }
  }
}
