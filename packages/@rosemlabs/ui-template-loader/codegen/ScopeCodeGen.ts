import { NodeType } from '@rosemlabs/dom-api'
import { BlankModule } from '@rosemlabs/xml-parser'
import { Attr, AttrList, EndTag, StartTag } from '@rosemlabs/xml-parser/nodes'

const CLASS_ATTR_NAME: string = 'class'

export default class ScopeCodeGen extends BlankModule {
  private scopeId?: string
  // private elementsDepth: number = 0

  setScopeId(scopeId: string): void {
    this.scopeId = scopeId
  }

  startTag<T extends StartTag>(element: T): void {
    // ++this.elementsDepth

    if (null == this.scopeId) {
      return
    }

    const scopeCSSClass: string = this.scopeId
    const attrs: AttrList = element.attrs
    const lastAttrEnd: number =
      attrs.length > 0 ? attrs[attrs.length - 1].end : element.start
    let classAttr: Attr | undefined = attrs.find(
      (attr: Attr): boolean => CLASS_ATTR_NAME === attr.nameLowerCased
    )

    if (!classAttr) {
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
        ? scopeCSSClass
        : ` ${scopeCSSClass}`
  }

  endTag<T extends EndTag>(element: T): void {
    // --this.elementsDepth
  }
}
