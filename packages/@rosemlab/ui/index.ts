import ObservableObject from '@rosemlab/observable/ObservableObject'
import VirtualDOMHyperRenderer from '@rosemlab/virtual-dom/HyperRenderer'
import { VirtualInstance } from '@rosemlab/virtual-dom'
import WebDOMRenderer from '@rosemlab/ui-patform-web/WebRenderer'
import VirtualDOMHydrator from '@rosemlab/virtual-dom/Hydrator'

const hyperRenderer = new VirtualDOMHyperRenderer()
const webRenderer = new WebDOMRenderer()
const virtualDOMHydrator = new VirtualDOMHydrator<Node>()

const vm = {
  template: '<div class="title">Hello, {{ this.name }}!</div>',
  render(h: Function): VirtualInstance {
    // @ts-ignore
    const vnode = h('div', { attrs: { class: 'title' } }, `Hello, ${this.name}!`)
    console.log(vnode)
    // @ts-ignore
    document.body.firstElementChild.replaceWith(virtualDOMHydrator.hydrate(vnode, webRenderer))
    return vnode
  },
  data() {
    return {
      name: 'Rosem',
    }
  },
}

const $data = ObservableObject.create(vm.data())
vm.render = vm.render.bind($data, hyperRenderer.createInstance)
// @ts-ignore
vm.render()
ObservableObject.observeProperty($data, 'name', vm.render)

// @ts-ignore
window.$data = $data
