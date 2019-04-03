import setStyle from '@rosem-util/dom/setStyle'
import { Detail, DetailInit } from '../Module'
import ModuleInit from '../ModuleInit'

export type ClassList = string[]
export type AttrMap = Record<string, string | number | boolean>
export type StyleMap = Record<string, string | number>

export default class SetAfterEnd extends ModuleInit {
  classList: ClassList
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
      setClassListAfterEnd: this.classList,
      setStyleMapAfterEnd: this.styleMap,
      setAttributeMapAfterEnd: this.attributeMap,
    }
  }
}
