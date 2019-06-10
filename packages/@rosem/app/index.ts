// @ts-ignore
// import Style from './style.css' //mtc - multi-type container
import App from './App.sfc' //mtc - multi-type container
import VirtualDOMHyperRenderer from '@rosem/virtual-dom/HyperRenderer'

const virtualDOMRenderer = new VirtualDOMHyperRenderer()
// console.log(Style)
console.log(App)

// @ts-ignore
const app = new App.template[0].content(virtualDOMRenderer)
console.log(app);

// require('@rosem/dom-metric/test')
// require('@rosem/ui')
// import observable from '@rosem/observable-object'
// import Transition from '@rosem/ui-transition'
//
// const t = new Transition(host.body)
// console.log(t)

// import Reaction from '@rosem/observable'
// import testCompiler from './testCompiler'

// observable.test()
// console.log(testCompiler())
// console.log(testUIPlatformWEB())
// Transition.test2()
// Reaction.test()
