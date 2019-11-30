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

export type EventListener<Context, Event, Params extends unknown[] = unknown[]> = <
  T extends Event
>(
  this: Context,
  event: T,
  ...args: Params
) => unknown

export type EventListenerMap<Context, Map extends EventMap<unknown>> = {
  [Name in keyof Map]: (Map[Name] extends unknown[]
    ? EventListener<Context, Head<Map[Name]>, Tail<Map[Name]>>
    : EventListener<Context, Map[Name]>)[]
}

export default class EventEmitter<
  Context extends EventEmitter<Context, Map, Event>,
  Map extends EventMap<Event>,
  Event = unknown
> {
  private listeners: EventListenerMap<Context, Map> = {} as EventListenerMap<Context, Map>

  on<Name extends keyof Map>(
    event: Name,
    listener: EventListenerMap<Context, Map>[Name][0]
  ): this {
    if (this.listeners[event] !== void 0) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)

    return this
  }

  emit<Name extends keyof Map>(
    event: Name,
    ...args: Parameters<EventListenerMap<Context, Map>[Name][0]>
  ): boolean {
    for (const listener of this.listeners[event]) {
      // Reflect.apply(listener, this, args)
      listener.apply(this, args)
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
