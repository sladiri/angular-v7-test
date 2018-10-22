import Deque from "double-ended-queue";
import { IEventsIterator, IMessage, Transducer } from "./IEventsIterator";

// https://medium.com/dailyjs/async-generators-as-an-alternative-to-state-management-f9871390ffca
export class EventsIterator implements IEventsIterator {
  static readonly TOKEN_DELETE: string = "DELETE";
  static readonly DEFAULT_TYPE: string = "--";

  transducers: Array<Transducer>;

  private readonly producer: AsyncIterableIterator<IMessage>;
  private readonly iterator;

  private readonly queue: any;
  private callback: () => void;
  private isDone: Boolean = false;

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

  constructor(messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error(
        "EventsIterator: Message queue capacity must be safe integer.",
      );
    }
    this.queue = new Deque(messageQueueCapacity);
    this.producer = this._producer();
    this.iterator = this.producer[Symbol.asyncIterator]();
  }

  next() {
    return this.producer.next();
  }

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  async start(transducers: Array<Transducer>, isTest = false) {
    if (transducers.length < 1) {
      console.warn("EventsIterator: Start has no transducer");
    }
    const main = EventsIterator.pipe(transducers);
    const source = main(this, this.dispatch.bind(this));
    if (isTest) {
      return source;
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
    if (this.callback) {
      this.callback();
    }
    this.queue.push(item);
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
        //   "f1",
        //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
        // );
        yield item;
        // console.log(
        //   "f2",
        //   item.type === EventsIterator.DEFAULT_TYPE ? item : item.type,
        // );
        // console.log("f2");
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
