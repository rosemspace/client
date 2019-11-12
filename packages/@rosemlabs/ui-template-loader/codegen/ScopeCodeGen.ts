import { BlankModule } from '@rosemlabs/xml-parser'
import { Attr, AttrList, StartTag } from '@rosemlabs/xml-parser/nodes'
import { ScopeType } from '../index'

const CLASS_ATTR_NAME: string = 'class'

const getLastAttributeOffset = (
  attrs: AttrList,
  fallbackOffset: number
): number => (attrs.length > 0 ? attrs[attrs.length - 1].end : fallbackOffset)

export default class ScopeCodeGen extends BlankModule {
  private scopeId?: string
  private scopeType?: ScopeType

  setScope(scopeId: string, scopeType?: 'class' | 'attr'): void {
    this.scopeId = scopeId
    this.scopeType = scopeType
  }

  startTag<T extends StartTag>(element: T): void {
    if (null == this.scopeId) {
      return
    }

    const scopeId: string = this.scopeId
    const attrs: AttrList = element.attrs

    if (this.scopeType === 'class') {
      let classAttr: Attr | undefined = attrs.find(
        (attr: Attr): boolean => CLASS_ATTR_NAME === attr.nameLowerCased
      )

      if (!classAttr) {
        const lastAttrEnd: number = getLastAttributeOffset(attrs, element.start)

        classAttr = {
          // nodeType: NodeType.ATTRIBUTE_NODE,
          // nodeName: CLASS_ATTR_NAME,
          localName: CLASS_ATTR_NAME,
          name: CLASS_ATTR_NAME,
          nameLowerCased: CLASS_ATTR_NAME,
          namespaceURI: element.namespaceURI,
          ownerElement: element,
          prefix: undefined,
          value: '',
          start: lastAttrEnd,
          end: lastAttrEnd,
        }
        attrs.push(classAttr)
      }

      classAttr.value +=
        !classAttr.value || classAttr.value.endsWith(' ')
          ? scopeId
          : ` ${scopeId}`

      return
    }

    const lastAttrEnd: number = getLastAttributeOffset(attrs, element.start)

    attrs.push({
      // nodeType: NodeType.ATTRIBUTE_NODE,
      // nodeName: CLASS_ATTR_NAME,
      localName: scopeId,
      name: scopeId,
      nameLowerCased: scopeId,
      namespaceURI: element.namespaceURI,
      ownerElement: element,
      prefix: undefined,
      value: '',
      start: lastAttrEnd,
      end: lastAttrEnd,
    })
  }
}
