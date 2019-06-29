import ObservableObject from '@rosemlab/observable/ObservableObject'
import { VDOMHydrator, VDOMHyperRenderer, VirtualInstance } from '@rosemlab/virtual-dom'
import WebDOMRenderer from '@rosemlab/ui-patform-web/WebRenderer'

const vdomHyperRenderer = new VDOMHyperRenderer()
const webRenderer = new WebDOMRenderer()
const vdomHydrator = new VDOMHydrator<Node>()

const vm = {
  template: '<div class="title">Hello, {{ this.name }}!</div>',
  render(h: Function): VirtualInstance {
    // @ts-ignore
    const vnode = h('div', { attrs: { class: 'title' } }, `Hello, ${this.name}!`)
    console.log(vnode)
    // @ts-ignore
    document.body.firstElementChild.replaceWith(vdomHydrator.hydrate(vnode, webRenderer))
    return vnode
  },
  data() {
    return {
      name: 'Rosem',
    }
  },
}

const $data = ObservableObject.create(vm.data())
vm.render = vm.render.bind($data, vdomHyperRenderer.createInstance)
// @ts-ignore
vm.render()
ObservableObject.observeProperty($data, 'name', vm.render)

// @ts-ignore
window.$data = $data
