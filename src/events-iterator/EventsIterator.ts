import Deque from "double-ended-queue";
import { IEventsIterator, Transducer } from "./IEventsIterator";

// https://medium.com/dailyjs/async-generators-as-an-alternative-to-state-management-f9871390ffca
export class EventsProcessor
  implements AsyncIterableIterator<Object>, IEventsIterator<Object> {
  static readonly TOKEN_DELETE: string = "DELETE";

  private iterator: AsyncIterableIterator<Object>;
  private queue: any;
  private callback: () => void;
  private isDone: Boolean = false;

  static pipe(transducers: Array<Transducer<Object>> = []) {
    const pipeline = (source, dispatch) => {
      for (const t of transducers) {
        source = t(source, dispatch);
      }
      return source;
    };
    return pipeline;
  }

  constructor(messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error("Message queue capacity must be safe integer.");
    }
    this.queue = new Deque(messageQueueCapacity);
    this.iterator = Object.assign(Object.create(null), {
      next: async () => {
        const res = this.next();
        return res;
      },
    });
  }

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  async next() {
    if (!this.queue.isEmpty()) {
      const value = this.queue.shift();
      const done = (this.isDone =
        value && value.type === EventsProcessor.TOKEN_DELETE);
      return { value, done };
    } else {
      await new Promise(resolve => {
        this.callback = resolve;
      });
      this.callback = null;
      return this.next();
    }
  }

  async start(transducers: Array<Transducer<Object>> = []): Promise<void> {
    const main = EventsProcessor.pipe(transducers);
    const source = main(this, this.dispatch.bind(this));
    for await (const i of source) {
    }
  }

  stop() {
    this.dispatch({ type: EventsProcessor.TOKEN_DELETE });
  }

  dispatch(item: Object) {
    if (this.isDone) {
      console.warn(
        "EventsIterator done, but dispatch was called with item:",
        item,
      );
      return;
    }
    if (this.callback) {
      this.callback();
    }
    this.queue.push(item);
  }
}
