import isArray from 'lodash/isArray'
import { Detail } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export default class RemoveBeforeStart extends AbstractModule {
  classList: Array<string>
  stylePropertyList: Array<string>
  attributeList: Array<string>

  constructor(
    classList: Array<string> | string = '',
    stylePropertyList: Array<string> = ['display'],
    attributeList: Array<string> = []
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
      target.style[property] = ''
    }

    for (const property of this.attributeList) {
      target.removeAttribute(property)
    }
  }

  getDetail(): Detail {
    return {
      removeClassListBeforeStart: this.classList,
      removeStylePropertyListBeforeStart: this.stylePropertyList,
      removeAttributeListBeforeStart: this.attributeList,
    }
  }
}
