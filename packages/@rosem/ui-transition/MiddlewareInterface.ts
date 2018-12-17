export enum Phase {
  beforeStart,
  start,
  afterEnd,
  cancelled,
}

export type Details = { [name: string]: any }

export default interface MiddlewareInterface {
  [Phase.beforeStart]?(details: Details): void

  [Phase.start]?(details: Details): void

  [Phase.afterEnd]?(details: Details): void

  [Phase.cancelled]?(details: Details): void

  getDetails?(assignTo: Details): Details
}
