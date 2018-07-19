import nanoid from 'nanoid'

export class Uuid {
  _uuid

  generate() {
    this._uuid = nanoid()

    return this.getLast()
  }

  getLast() {
    return this._uuid
  }
}

export default {
  install(Vue) {
    Vue.prototype.$_rosem_uuid = new Uuid()
  },
}
