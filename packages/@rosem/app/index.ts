// import Transition from '@rosem/ui-transition/Transition'
//
// const t = new Transition(host.body)
// console.log(t)

import Reaction from '@rosem/observable'
import Transition from '@rosem/ui-transition'
// import { h, vHost } from '@rosem/vdom-html'
import TemplateParser from '@rosem/template-parser'

// window.h = h
// window.vHost = vHost

new TemplateParser().parseFromString(document.documentElement.innerHTML)
// Transition.test();
// Reaction.test()
