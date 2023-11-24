import EventEmitter from 'events'

export const EventResolverSymbol = Symbol.for('EventResolver')

export class AsyncEventEmitter extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listenerMap = new WeakMap<(...args: any[]) => void, (...args: any[]) => void>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitAsync(eventName: string | symbol, ...args: any[]): Promise<void> {
    return new Promise((resolve) => {
      Object.getPrototypeOf(resolve).key = EventResolverSymbol
      super.emit(eventName, ...args, resolve)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrappedListener = async (...args: any[]) => {
      // check if event called from `awaitForEventDone` function
      if (args?.length) {
        const resolver = args[args.length - 1]
        if (typeof resolver === 'function' && Object.getPrototypeOf(resolver).key === EventResolverSymbol) {
          try {
            await listener(...args)
            // eslint-disable-next-line no-empty
          } catch (e) {}
          return await resolver()
        }
      }
      return await listener(...args)
    }
    this.listenerMap.set(listener, wrappedListener)
    return super.on(eventName, wrappedListener)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrappedListener = async (...args: any[]) => {
      if (args?.length) {
        const resolver = args[args.length - 1]
        if (typeof resolver === 'function' && Object.getPrototypeOf(resolver).key === EventResolverSymbol) {
          try {
            await listener(...args)
            // eslint-disable-next-line no-empty
          } catch (e) {}
          // remove listeners after the event is done
          this.removeListener(eventName, listener)
          this.removeListener(eventName, wrappedListener)
          return await resolver()
        }
      }
      // remove listeners after the event is done
      this.removeListener(eventName, listener)
      this.removeListener(eventName, wrappedListener)
      return await listener(...args)
    }
    this.listenerMap.set(listener, wrappedListener)
    return super.once(eventName, wrappedListener)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const wrappedListener = this.listenerMap.get(listener)
    if (wrappedListener) {
      this.listenerMap.delete(listener)
      return super.removeListener(eventName, wrappedListener)
    }

    return this
  }

  off = this.removeListener
}
