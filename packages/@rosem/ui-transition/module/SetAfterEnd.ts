import isNumber from 'lodash/isNumber'
import { Detail } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export type AttrMap = Record<string, string | number | boolean>
export type StyleMap = Record<string, string | number>

export default class SetAfterEnd extends AbstractModule {
  classList: Array<string>
  styleMap: StyleMap
  attributeMap: AttrMap
  styleEntries: Array<Array<string | number>>
  attributeEntries: Array<Array<string | number | boolean>>

  constructor(
    classList: Array<string> | string = '',
    style: StyleMap = { display: 'none' },
    attributeMap: AttrMap = {}
  ) {
    super()
    this.classList = Array.isArray(classList)
      ? classList
      : '' !== classList
      ? classList.split(' ')
      : []
    this.styleMap = style
    this.styleEntries = Object.entries(style)
    this.attributeMap = attributeMap
    this.attributeEntries = Object.entries(attributeMap)
  }

  afterEnd({ target }: Detail): void {
    target.classList.add(...this.classList)

    for (const [property, value] of this.styleEntries) {
      target.style.setProperty(property, isNumber(value) ? String(value) + 'px' : value)
    }

    for (const [property, value] of this.attributeEntries) {
      target.setAttribute(property, true === value ? property : String(value))
    }
  }

  getDetails() {
    return {
      addClassListAfterEnd: this.classList,
      addStyleMapAfterEnd: this.styleMap,
      addAttributeMapAfterEnd: this.attributeMap,
    }
  }
}
