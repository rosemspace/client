import Watcher from './Watcher'
import removeArrayItem from '@rosem/util/removeArrayItem'

let uid = 0

/**
 * Wrapper around a value.
 */
export default class Dependency {
  static target: Watcher | null
  id: number
  watchers: Array<Watcher> = []

  constructor() {
    this.id = ++uid
  }

  addWatcher(watcher: Watcher) {
    this.watchers.push(watcher)
  }

  removeWatcher(watcher: Watcher) {
    removeArrayItem(this.watchers, watcher)
  }

  depend() {
    if (Dependency.target) {
      Dependency.target.addDependency(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.watchers.slice()
    // if (process.env.NODE_ENV !== 'production' && !config.async) {
    //   // subs aren't sorted in scheduler if not running async
    //   // we need to sort them now to make sure they fire in correct
    //   // order
    //   subs.sort((a, b) => a.id - b.id)
    // }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dependency.target = null
const targetStack: Array<Watcher | null> = []

export function pushTarget (target: Watcher | null) {
  targetStack.push(target)
  Dependency.target = target
}

export function popTarget () {
  targetStack.pop()
  Dependency.target = targetStack[targetStack.length - 1]
}
