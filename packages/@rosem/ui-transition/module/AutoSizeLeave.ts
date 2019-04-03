import setStyle from '@rosem-util/dom/setStyle'
import ModuleInit from '../ModuleInit'
import { Detail } from '../Module'

export default class AutoSizeLeave extends ModuleInit {
  protected readonly autoSizeList: ('width' | 'height')[]

  constructor(autoSizeList: ('width' | 'height')[]) {
    super()
    this.autoSizeList = autoSizeList
  }

  beforeStart({ target }: Detail) {
    if (this.autoSizeList.length) {
      setStyle(target, 'display', '')

      const boundingClientRect = target.getBoundingClientRect()

      this.autoSizeList.forEach(property => {
        setStyle(target, property, boundingClientRect[property] + 'px')
      })
    }
  }

  start({ target }: Detail) {
    this.autoSizeList.forEach(property => {
      setStyle(target, property, '')
    })
  }

  cancelled({ target }: Detail) {
    this.autoSizeList.forEach(property => {
      setStyle(target, property, '')
    })
  }

  getDetails() {
    return {
      auto: true,
      autoSizeList: this.autoSizeList,
    }
  }
}
