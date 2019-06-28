import { NodeType } from '@rosem/dom-api'
import {
  VirtualCDATASection,
  VirtualElement,
  VirtualText,
} from '@rosem/virtual-dom'
import xmlParser from '../__mocks__/xmlParser'

describe('parseFromString', () => {
  describe('End tag', () => {
    it('Case of letters of end tag name should be kept', () => {
      const source = '<ul><li>1<li>2</UL>'
      // const children = xmlParser.parseFromString(source).children
      // const cDataNode: VirtualCDATASection = children[0] as VirtualCDATASection
      //
      // expect(cDataNode.type).toEqual(NodeType.CDATA_SECTION_NODE)
      // expect(cDataNode.text).toEqual('d&nbsp;a<br>ta]]')
    })
  })

  describe('CDATA section', () => {
    it('parse CDATA section', () => {
      const source = '<![CDATA[d&nbsp;a<br>ta]]]]>'
      const children = xmlParser.parseFromString(source).children
      const cDataNode: VirtualCDATASection = children[0] as VirtualCDATASection

      expect(cDataNode.type).toEqual(NodeType.CDATA_SECTION_NODE)
      expect(cDataNode.text).toEqual('d&nbsp;a<br>ta]]')
    })

    it('parse CDATA section inside raw text element', () => {
      const source =
        "<script><![CDATA[if (test < 0 && test > 0) print('<tag>')]]></script>"
      const children = xmlParser.parseFromString(source).children
      const scriptElement: VirtualElement = children[0] as VirtualElement
      const cDataNode: VirtualCDATASection = scriptElement
        .children[0] as VirtualCDATASection

      expect(cDataNode.type).toEqual(NodeType.CDATA_SECTION_NODE)
      expect(cDataNode.text).toEqual("if (test < 0 && test > 0) print('<tag>')")
    })

    it('parse CDATA section after conditional comment', () => {
      const source = 'Test of <![cond<tag>]><![CDATA[</tag>]>]]> section'
      const children = xmlParser.parseFromString(source).children

      expect(children.length).toBeGreaterThan(2)

      const cDataNode: VirtualCDATASection = children[
        children.length - 2
      ] as VirtualCDATASection
      const textNode: VirtualText = children[children.length - 1] as VirtualText

      expect(cDataNode.type).toEqual(NodeType.CDATA_SECTION_NODE)
      expect(cDataNode.text).toEqual('</tag>]>')
      expect(textNode.type).toEqual(NodeType.TEXT_NODE)
      expect(textNode.text).toEqual(' section')
    })
  })
})
