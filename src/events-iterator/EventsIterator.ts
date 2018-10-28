import Deque from "double-ended-queue";
import { IEventsIterator, IMessage, Transducer } from "./IEventsIterator";

// https://medium.com/dailyjs/async-generators-as-an-alternative-to-state-management-f9871390ffca
export class EventsIterator<Message extends IMessage>
  implements IEventsIterator<Message> {
  readonly TOKEN_DELETE: Message = Object.assign(Object.create(null), {
    type: "DELETE",
  });
  readonly TOKEN_TYPE_DEFAULT: string = "DEFAULT_MSG_TYPE";

  private readonly queue: any;
  private readonly producer: AsyncIterableIterator<Message>;

  private callback: null | (() => void) = null;
  private isDone = false;

  private transducers: Array<Transducer<Message>>; // Test API
  private testProducer: AsyncIterableIterator<Message>;
  private testProducerIterator: AsyncIterableIterator<Message>;

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

  constructor(messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error(
        "EventsIterator: Message queue capacity must be safe integer.",
      );
    }
    this.queue = new Deque(messageQueueCapacity);
    this.producer = this._producer();
  }

  // Test API
  next() {
    if (!this.testProducer) {
      throw new Error("EventsIterator: No iterable defined, was start called?");
    }
    return this.testProducer.next();
  }

  // Test API
  [Symbol.asyncIterator]() {
    if (!this.testProducerIterator) {
      throw new Error("EventsIterator: No iterator defined, was start called?");
    }
    return this.testProducerIterator;
  }

  async start(transducers?: Array<Transducer<Message>>) {
    const isTest = !Array.isArray(transducers);

    if (!isTest && transducers) {
      if (transducers.length < 1) {
        console.warn("EventsIterator: Start has no transducer");
      }
      this.transducers = transducers;
    }
    const main = this.pipe(this.transducers);

    if (isTest) {
      this.stop();
      await this.producer.next();
      if (!this.queue.isEmpty()) {
        throw new Error("EventsIterator: Queue was not empty for test.");
      }
      this.isDone = false;

      this.testProducer = this._producer();
      this.testProducerIterator = this.testProducer[Symbol.asyncIterator]();

      const testSource = main(this.testProducer, this.dispatch.bind(this));
      return testSource;
    }

    const source = main(this.producer, this.dispatch.bind(this));
    for await (const item of source) {
      // console.log("EventsIterator: consumed item", item);
    }
  }

  stop() {
    this.dispatch(this.TOKEN_DELETE);
  }

  dispatch(item: Message) {
    if (this.isDone) {
      console.warn("EventsIterator done, but dispatch was called");
      return;
    }
    if (item.type === undefined) {
      item.type = this.TOKEN_TYPE_DEFAULT;
    }
    this.queue.push(item);
    if (this.callback) {
      this.callback();
    }
  }

  private async *_producer() {
    while (true) {
      while (!this.queue.isEmpty()) {
        const item: Message = this.queue.shift();
        yield item;
        if (item.type === "DELETE") {
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
