import Deque from "double-ended-queue";
import { IQueuedIterator, Transducer } from "./IQueuedIterator";

// https://medium.com/dailyjs/async-generators-as-an-alternative-to-state-management-f9871390ffca
export class QueuedIterator<Message extends object>
  implements IQueuedIterator<Message> {
  private readonly queue: any;
  private readonly TOKEN_DELETE: Message;
  private readonly producer = this._producer();
  private callback: null | (() => void) = null;
  private isDone = false;

  pipe(transducers: Array<Transducer<Message>> = []): Transducer<Message> {
    const pipeline = (source, dispatch) => {
      for (const t of transducers) {
        source = t(this.share(source), dispatch);
      }
      return source;
    };
    return pipeline;
  }

  share(iterable: AsyncIterable<Message>): AsyncIterableIterator<Message> {
    const iterator = iterable[Symbol.asyncIterator]();
    return Object.assign(Object.create(null), {
      next(value: Message) {
        return iterator.next(value);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      return() {},
    });
  }

  constructor(TOKEN_DELETE: Message, messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error(
        "QueuedIterator: Message queue capacity must be safe integer.",
      );
    }
    this.queue = new Deque(messageQueueCapacity);
    this.TOKEN_DELETE = TOKEN_DELETE;
  }

  async start(transducers: Array<Transducer<Message>>) {
    if (transducers.length < 1) {
      console.warn("QueuedIterator: Start has no transducer");
    }

    const main = this.pipe(transducers);
    const source = main(this.producer, this.dispatch.bind(this));

    for await (const item of source) {
      // console.log("QueuedIterator: consumed item", item);
    }
  }

  stop() {
    this.dispatch(this.TOKEN_DELETE);
  }

  dispatch(item: Message) {
    if (this.isDone) {
      console.warn("QueuedIterator done, but dispatch was called.");
      return;
    }
    this.queue.push(item);
    if (this.callback) {
      this.callback();
    }
  }

  clearQueue() {
    this.queue.clear();
  }

  private async *_producer() {
    while (true) {
      while (!this.queue.isEmpty()) {
        const item = this.queue.shift() as Message;
        yield item;
        if (JSON.stringify(item) === JSON.stringify(this.TOKEN_DELETE)) {
          this.isDone = true;
          return;
        }
      }
      await new Promise(resolve => {
        this.callback = resolve;
      });
      this.callback = null;
    }
  }
}
