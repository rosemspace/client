import setStyle from '@rosem-util/dom/setStyle'
import ModuleInit from '../ModuleInit'
import { Detail } from '../Module'

export default class AutoSizeEnter extends ModuleInit {
  protected readonly autoSizeList: ('width' | 'height')[]

  constructor(autoSizeList: ('width' | 'height')[] = ['width', 'height']) {
    super()
    this.autoSizeList = autoSizeList
  }

  beforeStart(detail: Detail) {
    if (this.autoSizeList.length) {
      const target = detail.target

      detail.autoValues = {}
      setStyle(target, 'display', '')

      let boundingClientRect: ClientRect = target.getBoundingClientRect()
      const values: number[] = []

      this.autoSizeList.forEach((property: keyof ClientRect) => {
        values.push(boundingClientRect[property])
        setStyle(target, property, 'auto')
      })
      boundingClientRect = target.getBoundingClientRect()
      this.autoSizeList.forEach((property, index) => {
        detail.autoValues[property] = boundingClientRect[property]
        setStyle(target, property, `${values[index]}px`)
      })
    }
  }

  start({ target, autoValues }: Detail) {
    this.autoSizeList.forEach((property) => {
      setStyle(target, property, `${autoValues[property]}px`)
    })
  }

  afterEnd({ target }: Detail) {
    this.autoSizeList.forEach((property) => {
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
