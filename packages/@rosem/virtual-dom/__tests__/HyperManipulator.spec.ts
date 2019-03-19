import { VirtualNodeType } from '../VirtualInstance'
import hyperManipulatorFactory from '../__mocks__/hyperManipulatorFactory'

const globalHyperManipulator = hyperManipulatorFactory()

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
    const instance = hyperManipulatorFactory().createInstance('div')

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
