// import Style from './style.css' //mtc - multi-type container
import App from './App.sfc' //mtc - multi-type container
import VirtualDOMHyperRenderer from '@rosemlab/virtual-dom/HyperRenderer'
import WebDOMRenderer from '@rosemlab/ui-patform-web/WebRenderer'
import VirtualDOMHydrator from '@rosemlab/virtual-dom/Hydrator'

const virtualHyperDOMRenderer = new VirtualDOMHyperRenderer()
const webDOMRenderer = new WebDOMRenderer()
const virtualDOMHydrator = new VirtualDOMHydrator<Node>()
// @ts-ignore
const data = App.script[0].content.setup()
// @ts-ignore
const app = App.template[0].content.call(data, virtualHyperDOMRenderer, data)

console.log(App)
console.log(app);
document.querySelector('#app')!.appendChild(virtualDOMHydrator.hydrate(app, webDOMRenderer))

// require('@rosemlab/dom-metric/test')
// require('@rosemlab/ui')
// import observable from '@rosemlab/observable-object'
// import Transition from '@rosemlab/ui-transition'
//
// const t = new Transition(host.body)
// console.log(t)

// import Reaction from '@rosemlab/observable'
// import testCompiler from './testCompiler'

// observable.test()
// console.log(testCompiler())
// console.log(testUIPlatformWEB())
// Transition.test2()
// Reaction.test()
