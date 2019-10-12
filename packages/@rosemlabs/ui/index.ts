import ObservableObject from '@rosemlabs/observable/ObservableObject'
import { VDOMConverter, VDOMHyperRenderer, VirtualInstance } from '@rosemlabs/virtual-dom'
import WebDOMRenderer from '@rosemlabs/web-ui/WebRenderer'

const vDOMHyperRenderer = new VDOMHyperRenderer()
const webRenderer = new WebDOMRenderer()
const vDOMConverter = new VDOMConverter<Node>()

const vm = {
  template: '<div class="title">Hello, {{ this.name }}!</div>',
  render(h: Function): VirtualInstance {
    // @ts-ignore
    const vnode = h('div', { attrs: { class: 'title' } }, `Hello, ${this.name}!`)
    console.log(vnode)
    // @ts-ignore
    document.body.firstElementChild.replaceWith(vDOMConverter.convert(vnode, webRenderer))
    return vnode
  },
  data() {
    return {
      name: 'Rosem',
    }
  },
}

const $data = ObservableObject.create(vm.data())
vm.render = vm.render.bind($data, vDOMHyperRenderer.createInstance)
// @ts-ignore
vm.render()
$data.observeProperty('name', vm.render)

// @ts-ignore
window.$data = $data
