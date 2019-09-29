// import Style from './style.css' //mtc - multi-type container
import { OBSERVABLE_KEY, ObservableObject } from '@rosemlab/observable'
import App from './App.sfc' //mtc - multi-type container
import { VDOMConverter, VDOMHyperRenderer } from '@rosemlab/virtual-dom'
import WebDOMRenderer from '@rosemlab/web-ui/WebRenderer'
import { isValidHTMLElementAttr } from '@rosemlab/html-syntax/attr'

//@ts-ignore
window.isValidHTMLElementAttr = isValidHTMLElementAttr

const vDOMHyperRenderer = new VDOMHyperRenderer()
const webDOMRenderer = new WebDOMRenderer()
const vDOMConverter = new VDOMConverter<Node>()

//@ts-ignore
const data: ObservableObject = App.script[0].output.setup()
//@ts-ignore
const render: Function = App.template[0].output
const vNode = render.call(data, vDOMHyperRenderer, data)

console.log(App)
console.log(data)
console.log(vNode)
const el = document.querySelector('#app')!

el.appendChild(vDOMConverter.convert(vNode, webDOMRenderer))

data[OBSERVABLE_KEY].observe(function() {
  const vNode = render.call(data, vDOMHyperRenderer, data)

  el.innerHTML = ''
  el.appendChild(vDOMConverter.convert(vNode, webDOMRenderer))
})

//@ts-ignore
window.data = data
// require('@rosemlab/dom-metric/test')
// require('@rosemlab/ui')
// import observable from '@rosemlab/observable/test'
// import Transition from '@rosemlab/ui-transition'
//
// const t = new Transition(host.body)
// console.log(t)

// import Reaction from '@rosemlab/observable'
// import testCompiler from './testCompiler'

// observable.test3()
// console.log(testCompiler())
// console.log(testUIPlatformWEB())
// Transition.test2()
// Reaction.test()
