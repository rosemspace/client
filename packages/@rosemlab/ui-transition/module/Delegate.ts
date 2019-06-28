import Module, { Detail } from '../Module'

export default class Delegate implements Module {
  cleanup(detail: Detail, next: () => void): void {
    next()
  }

  beforeStart(detail: Detail, next: () => void): void {
    next()
  }

  start(detail: Detail, next: () => void): void {
    next()
  }

  afterEnd(detail: Detail, next: () => void): void {
    next()
  }

  cancelled(detail: Detail, next: () => void): void {
    next()
  }

  getDetail(): Partial<Detail> {
    return {}
  }
}
