import { Detail } from '../Module'
import Delegate from './Delegate'

export default class HideAfterEnd extends Delegate {
  afterEnd(detail: Detail, next: () => void): void {
    detail.target.style.setProperty('display', 'none')

    super.afterEnd(detail, next)
  }

  getDetail(): Partial<Detail> {
    return {
      hideAfterEnd: true,
    }
  }
}
