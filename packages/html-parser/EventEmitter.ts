export type EventMap<Event = unknown> = Record<string | symbol, Event>

export type EventListener<Event, Params extends unknown[] = unknown[]> = (
  event: Event,
  ...args: Params
) => unknown

export type EventListenerMap<Map extends EventMap<Event>, Event = unknown> = {
  [Name in keyof Map]: EventListener<Map[Name]>[]
}

export default class EventEmitter<
  Map extends EventMap<Event>,
  Event = unknown
> {
  protected listeners: EventListenerMap<Map, Event> = {} as EventListenerMap<
    Map,
    Event
  >

  on<Name extends keyof Map>(
    event: Name,
    listener: EventListener<Map[Name]>
  ): this {
    if (this.listeners[event] === undefined) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)

    return this
  }

  emit<Name extends keyof Map>(
    event: Name,
    ...args: Parameters<EventListener<Map[Name]>>
  ): boolean {
    if (!this.listeners[event]) {
      return false
    }

    for (const listener of this.listeners[event]) {
      listener(...args)
    }

    return true
  }
}
