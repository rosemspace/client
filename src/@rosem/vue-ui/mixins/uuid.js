import uuidv1 from 'uuid/v1'

export class Uuid {
  _uuid

  generate() {
    this._uuid = uuidv1()

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
