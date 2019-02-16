// import Transition from '@rosem/ui-transition/Transition'
//
// const t = new Transition(host.body)
// console.log(t)

import Reaction from '@rosem/observable'
import Transition from '@rosem/ui-transition'
import { h, host, vHost } from '@rosem/vdom-html'
import TemplateParser from '@rosem/template-parser'

// @ts-ignore
window.h = h
// @ts-ignore
window.host = host
// @ts-ignore
window.vHost = vHost

// new TemplateParser().parseFromString(document.documentElement.innerHTML)
// Transition.test();
// Reaction.test()
