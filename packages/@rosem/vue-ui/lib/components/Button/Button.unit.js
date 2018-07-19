import Button from './Button'

describe('@rosem/vue-ui/components/RosemButton', () => {
  it('renders its content', () => {
    const slotContent = '<span>foo</span>'
    const { element } = shallowMount(Button, {
      slots: {
        default: slotContent,
      },
    })
    expect(element.innerHTML).toContain(slotContent)
  })
})
