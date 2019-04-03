import { isArray } from 'lodash-es'
import setStyle from '@rosem-util/dom/setStyle'
import { Detail, DetailInit } from '../Module'
import ModuleInit from '../ModuleInit'

export default class RemoveBeforeStart extends ModuleInit {
  classList: string[]
  stylePropertyList: string[]
  attributeList: string[]

  constructor(
    classList: string[] | string = '',
    stylePropertyList: string[] = ['display'],
    attributeList: string[] = []
  ) {
    super()
    this.classList = isArray(classList)
      ? classList
      : '' !== classList
      ? classList.split(' ')
      : []
    this.stylePropertyList = stylePropertyList
    this.attributeList = attributeList
  }

  beforeStart({ target }: Detail): void {
    target.classList.remove(...this.classList)

    for (const property of this.stylePropertyList) {
      setStyle(target, property, '')
    }

    for (const property of this.attributeList) {
      target.removeAttribute(property)
    }
  }

  getDetail(): DetailInit {
    return {
      removeClassListBeforeStart: this.classList,
      removeStylePropertyListBeforeStart: this.stylePropertyList,
      removeAttributeListBeforeStart: this.attributeList,
    }
  }
}
