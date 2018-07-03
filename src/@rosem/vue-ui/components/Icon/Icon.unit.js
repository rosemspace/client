import Icon from './Icon'

describe('@rosem/vue-ui/components/_base-icon', () => {
  it('renders a font-awesome icon', () => {
    const { element } = mount(Icon, {
      propsData: {
        name: 'sync',
      },
    })

    expect(element.tagName).toEqual('svg')
    expect(element.classList).toContain('svg-inline--fa', 'fa-sync', 'fa-w-16')
  })

  it('renders a custom icon', () => {
    const { element } = shallowMount(Icon, {
      ...createComponentMocks({
        style: {
          iconCustomSomeIcon: 'generated-class-name',
        },
      }),
      propsData: {
        source: 'custom',
        name: 'some-icon',
      },
    })

    expect(element.className).toEqual('generated-class-name')
  })
})
