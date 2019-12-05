type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => void) extends (
  head: any,
  ...tail: infer U
) => any
  ? U
  : never

export type EventMap<Event = unknown> = Record<
  string | symbol,
  Event | [Event, ...unknown[]]
>

export type EventListener<Event, Params extends unknown[] = unknown[]> = <
  T extends Event
>(
  event: T,
  ...args: Params
) => unknown

export type EventListenerMap<Map extends EventMap<unknown>> = {
  [Name in keyof Map]: (Map[Name] extends unknown[]
    ? EventListener<Head<Map[Name]>, Tail<Map[Name]>>
    : EventListener<Map[Name]>)[]
}

export default class EventEmitter<
  Map extends EventMap<Event>,
  Event = unknown
> {
  private listeners: EventListenerMap<Map> = {} as EventListenerMap<Map>

  on<Name extends keyof Map>(
    event: Name,
    listener: EventListenerMap<Map>[Name][0]
  ): this {
    if (this.listeners[event] !== void 0) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)

    return this
  }

  emit<Name extends keyof Map>(
    event: Name,
    ...args: Parameters<EventListenerMap<Map>[Name][0]>
  ): boolean {
    for (const listener of this.listeners[event]) {
      Reflect.apply(listener, this, args)
      // listener.apply(listener, args)
    }

    return true
  }
}

type text = {
  textContent: string
}
type tag = {
  name: string
}
type warn = {
  message: string
}
// type events = {
//   text: text
//   tag: tag
//   warn: [warn, {start: number}]
// }
// const l: EventListenerMap<events> = {
//   text: [(event: text) => {}],
//   tag: [(event: tag) => {}],
//   warn: [(warn: warn, position: {start: number}) => {}],
// }
const e: EventEmitter<{
  text: text
  tag: tag
  warn: [warn, { start: number }]
}> = {} as any
e.on('warn', (event, position) => {
  event.message
  position.start
})
e.emit('warn', { message: '1' }, { start: 0 })

type t1 = (...args: [1, 2, 3]) => void
type t2 = Tail<Parameters<t1>>
const t3: t2 = [2, 3]
