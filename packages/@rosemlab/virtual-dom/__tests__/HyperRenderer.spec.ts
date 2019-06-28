import { NodeType } from '@rosemlab/dom-api'
import hyperRendererFactory from '@rosemlab/virtual-dom/__mocks__/hyperRendererFactory'

const globalHyperRenderer = hyperRendererFactory()

describe('createInstance', () => {
  it('create empty document fragment', () => {
    const instance = globalHyperRenderer.createInstance(
      NodeType.DOCUMENT_FRAGMENT_NODE
    )

    expect(instance).toEqual({
      type: NodeType.DOCUMENT_FRAGMENT_NODE,
      children: [],
    })
  })

  it('create empty element', () => {
    const instance = hyperRendererFactory().createInstance('div')

    expect(instance).toEqual({
      type: NodeType.ELEMENT_NODE,
      props: {
        tag: 'div',
        key: 1,
        attrs: {},
      },
      children: [],
    })
  })
})
