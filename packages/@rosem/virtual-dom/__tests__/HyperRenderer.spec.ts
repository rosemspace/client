import { VirtualNodeType } from '../VirtualInstance'
import hyperRendererFactory from '@rosem/virtual-dom/__mocks__/hyperRendererFactory'

const globalHyperManipulator = hyperRendererFactory()

describe('createInstance', () => {
  it('create empty document fragment', () => {
    const instance = globalHyperManipulator.createInstance(
      VirtualNodeType.DOCUMENT_FRAGMENT_NODE
    )

    expect(instance).toEqual({
      type: VirtualNodeType.DOCUMENT_FRAGMENT_NODE,
      children: [],
    })
  })

  it('create empty element', () => {
    const instance = hyperRendererFactory().createInstance('div')

    expect(instance).toEqual({
      type: VirtualNodeType.ELEMENT_NODE,
      props: {
        tag: 'div',
        key: 1,
        attrs: {},
      },
      children: [],
    })
  })
})
