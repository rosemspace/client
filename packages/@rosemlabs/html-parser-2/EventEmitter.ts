export default class EventEmitter {
  private listeners: Record<string | symbol, ((...args: any[]) => void)[]> = {}

  addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    if (this.listeners[event as string] !== void 0) {
      this.listeners[event as string] = []
    }

    this.listeners[event as string].push(listener)

    return this
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return this
  }

  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return this
  }

  removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return this
  }

  off(event: string | symbol, listener: (...args: any[]) => void): this {
    return this
  }

  removeAllListeners(event?: string | symbol): this {
    return this
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    return true
  }
}
