import { BlankModule } from '@rosemlab/xml-parser'
import { Attr, AttrList, EndTag, StartTag } from '@rosemlab/xml-parser/nodes'

const CLASS_ATTR_NAME = 'class'

export default class ScopeCodeGen extends BlankModule {
  private scopeId?: string
  private elementsDepth: number = 0

  setScopeId(scopeId: string): void {
    this.scopeId = scopeId
  }

  startTag<T extends StartTag>(startTag: T): void {
    ++this.elementsDepth

    if (null == this.scopeId) {
      return
    }

    const scopeCSSClass: string = this.scopeId
    const attrs: AttrList = startTag.attrs
    const lastAttrEnd: number =
      attrs.length > 0 ? attrs[attrs.length - 1].end : startTag.end
    let classAttr: Attr | undefined = attrs.find(
      (attr: Attr): boolean => CLASS_ATTR_NAME === attr.nameLowerCased
    )

    if (!classAttr) {
      classAttr = {
        localName: CLASS_ATTR_NAME,
        name: CLASS_ATTR_NAME,
        nameLowerCased: CLASS_ATTR_NAME,
        namespaceURI: startTag.namespaceURI,
        ownerElement: startTag,
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

  endTag<T extends EndTag>(endTag: T): void {
    --this.elementsDepth
  }
}
