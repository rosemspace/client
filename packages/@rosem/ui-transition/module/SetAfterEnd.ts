import setStyle from '@rosem-util/dom/setStyle'
import { Detail, DetailInit } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export type AttrMap = Record<string, string | number | boolean>
export type StyleMap = Record<string, string | number>

export default class SetAfterEnd extends AbstractModule {
  classList: string[]
  styleMap: StyleMap
  attributeMap: AttrMap
  styleEntries: [string, string | number][]
  attributeEntries: [string, string | number | boolean][]

  constructor(
    classList: string[] | string = '',
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
      setStyle(target, property, value)
    }

    for (const [property, value] of this.attributeEntries) {
      target.setAttribute(
        String(property),
        String(true === value ? property : value)
      )
    }
  }

  getDetails(): DetailInit {
    return {
      addClassListAfterEnd: this.classList,
      addStyleMapAfterEnd: this.styleMap,
      addAttributeMapAfterEnd: this.attributeMap,
    }
  }
}
