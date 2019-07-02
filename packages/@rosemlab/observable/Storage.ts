import Observer from './Observer'

export default interface Storage {
  observer?: Observer
  allowComputed: boolean
}
