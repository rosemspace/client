import 'requestidlecallback'
import 'setimmediate'

import { polyfill } from 'raf'

import qm from './queueMicrotask'

polyfill(globalThis)
globalThis.queueMicrotask = qm
