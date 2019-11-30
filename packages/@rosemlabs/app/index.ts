// require('@rosemlabs/motion')
//
// //@ts-ignore
// if (module.hot) {
//   //@ts-ignore
//   module.hot.accept()
// }
// require('@rosemlabs/observable-reactive/test')

// // import Style from './style.css' //mtc - multi-type container
import { OBSERVATION_KEY, ObservableObject } from '@rosemlabs/observable'
import App from './App.sfc' //mtc - multi-type container
import { VDOMConverter, VDOMHyperRenderer } from '@rosemlabs/virtual-dom'
import { WebDOMRenderer } from '@rosemlabs/web-ui'
import { isHTMLElementAttribute } from '@rosemlabs/html-util/attr'
//@ts-ignore
console.log(App)//.script[0].output.setup());

//@ts-ignore
window.isHTMLElementAttribute = isHTMLElementAttribute

const vDOMHyperRenderer = new VDOMHyperRenderer()
const webDOMRenderer = new WebDOMRenderer()
const vDOMConverter = new VDOMConverter<Node>()

//@ts-ignore
const data: ObservableObject = App.blocks.script[0].output.setup()
//@ts-ignore
const render: Function = App.blocks.template[0].output
const vNode = render.call(data, vDOMHyperRenderer, data)

// console.log(App)
// console.log(data)
// console.log(vNode)
const el = document.querySelector('#app')!
debugger
el.appendChild(vDOMConverter.convert(vNode, webDOMRenderer))

// data[OBSERVATION_KEY].observe(function() {
//   const vNode = render.call(data, vDOMHyperRenderer, data)
//
//   el.innerHTML = ''
//   el.appendChild(vDOMConverter.convert(vNode, webDOMRenderer))
// })
//
// //@ts-ignore
// window.data = data
// // require('@rosemlabs/dom-metric/test')
// // require('@rosemlabs/ui')
// // import observable from '@rosemlabs/observable/test'
// // import Transition from '@rosemlabs/ui-transition'
// //
// // const t = new Transition(host.body)
// // console.log(t)
//
// // import Reaction from '@rosemlabs/observable'
// // import testCompiler from './testCompiler'
//
// // observable.test3()
// // console.log(testCompiler())
// // console.log(testUIPlatformWEB())
// // Transition.test2()
// // Reaction.test()
