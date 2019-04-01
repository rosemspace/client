import ObservableObject from '@rosem/observable/ObservableObject'
import HyperRenderer from '@rosem/virtual-dom/HyperRenderer'
import VirtualInstance from '@rosem/virtual-dom/VirtualInstance'
import WebRenderer from '@rosem/ui-patform-web/WebRenderer'
import VirtualHydrator from '@rosem/virtual-dom/VirtualHydrator'

const hyperRenderer = new HyperRenderer()
const webRenderer = new WebRenderer()
const virtualHydrator = new VirtualHydrator<Node>()

const vm = {
  template: '<div class="title">Hello, {{ this.name }}!</div>',
  render(h: Function): VirtualInstance {
    const vnode = h('div', { attrs: { class: 'title' } }, `Hello, ${this.name}!`)
    console.log(vnode)
    document.body.firstElementChild.replaceWith(virtualHydrator.hydrate(vnode, webRenderer))
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
vm.render()
ObservableObject.observeProperty($data, 'name', vm.render)

window.$data = $data
