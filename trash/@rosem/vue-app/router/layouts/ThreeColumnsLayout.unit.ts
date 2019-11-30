import ThreeColumnsLayout from './ThreeColumnsLayout'

describe('@rosem/vue-app/router/layouts/DefaultLayout', () => {
  it('renders its content', () => {
    const slotContent = '<p>Hello!</p>'
    const { element } = shallowMount(ThreeColumnsLayout, {
      slots: {
        default: slotContent,
      },
    })
    expect(element.innerHTML).toContain(slotContent)
  })
})
