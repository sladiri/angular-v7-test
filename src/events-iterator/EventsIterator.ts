import Deque from "double-ended-queue";
import { IEventsIterator, IMessage, Transducer } from "./IEventsIterator";

// https://medium.com/dailyjs/async-generators-as-an-alternative-to-state-management-f9871390ffca
export class EventsIterator implements IEventsIterator {
  static readonly TOKEN_DELETE: string = "DELETE";
  static readonly DEFAULT_TYPE: string = "--";

  transducers: Array<Transducer>;

  private readonly messageQueueCapacity: number;
  private queue: any;
  private callback: () => void;
  private isDone: Boolean = false;

  private producer: AsyncIterableIterator<IMessage>;
  private outlet: AsyncIterableIterator<IMessage>;
  private outletIterator: AsyncIterableIterator<IMessage>;

  static pipe(transducers: Array<Transducer> = []): Transducer {
    const pipeline = (source, dispatch) => {
      for (const t of transducers) {
        source = t(EventsIterator.share(source), dispatch);
      }
      return source;
    };
    return pipeline;
  }

  static share(
    iterable: AsyncIterable<IMessage>,
  ): AsyncIterableIterator<IMessage> {
    const iterator = iterable[Symbol.asyncIterator]();
    return Object.assign(Object.create(null), {
      next(value: IMessage) {
        return iterator.next(value);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      return() {},
    });
  }

  private static async *_testTransducer(source) {
    for await (const item of source) {
      yield item;
    }
  }

  constructor(messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error(
        "EventsIterator: Message queue capacity must be safe integer.",
      );
    }
    this.messageQueueCapacity = messageQueueCapacity;
  }

  next() {
    if (!this.outlet) {
      throw new Error("EventsIterator: No iterable defined, was start called?");
    }
    return this.outlet.next();
  }

  [Symbol.asyncIterator]() {
    if (!this.outletIterator) {
      throw new Error("EventsIterator: No iterator defined, was start called?");
    }
    return this.outletIterator;
  }

  async start(
    transducers: Array<Transducer>,
    isTest = false,
    messageQueueCapacity = this.messageQueueCapacity,
  ) {
    if (transducers.length < 1) {
      console.warn("EventsIterator: Start has no transducer");
    }
    this.queue = new Deque(messageQueueCapacity);
    this.producer = this._producer();
    if (isTest) {
      const testTransducer = _source => {
        this.outlet = EventsIterator._testTransducer(_source);
        this.outletIterator = this.outlet[Symbol.asyncIterator]();
        return this.outlet;
      };
      transducers = [...transducers, testTransducer];
    }
    const main = EventsIterator.pipe(transducers);
    const source = main(this.producer, this.dispatch.bind(this));
    if (isTest) {
      return this;
    }
    this.transducers = transducers;
    for await (const item of source) {
      // console.log(
      //   "end",
      //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
      // );
      // await new Promise(r => setTimeout(r, 10));
    }
  }

  stop() {
    this.dispatch({ type: EventsIterator.TOKEN_DELETE });
  }

  dispatch(item: IMessage) {
    if (item.type === undefined) {
      item.type = EventsIterator.DEFAULT_TYPE;
    }
    if (this.isDone) {
      console.warn(
        "EventsIterator done, but dispatch was called with item:",
        item,
      );
      return;
    }
    this.queue.push(item);
    if (this.callback) {
      this.callback();
    }
    // console.log(
    //   "queue",
    //   this.queue.length,
    //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
    // );
  }

  private async *_producer() {
    while (true) {
      while (!this.queue.isEmpty()) {
        const item = this.queue.shift();
        // console.log(
        //   "_producer 0",
        //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
        // );
        yield item;
        // console.log(
        //   "_producer 1",
        //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
        // );
        // console.log("_producer 1");
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
