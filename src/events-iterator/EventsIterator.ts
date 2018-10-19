import Deque from "double-ended-queue";
import { IEventsIterator } from "./IEventsIterator";

// https://medium.com/dailyjs/decoupling-business-logic-using-async-generators-cc257f80ab33

export class EventsIterator implements IEventsIterator {
  public transducers = []; // Testing API
  private callback: Function = null;
  private queue: any;
  private isTest = false;

  constructor(messageQueueCapacity: number = 2048) {
    if (!Number.isSafeInteger(messageQueueCapacity)) {
      throw new Error("Message queue capacity must be safe integer.");
    }
    this.queue = new Deque(messageQueueCapacity);
  }

  public start(transducers, isTest = false) {
    this.isTest = isTest;
    this.transducers = [...transducers, this.testOutput.bind(this)];
    const pipeline = this.pipelineTransducers(this.transducers);
    const processed = pipeline(this.share(this.share(this.produce())));
    this.consume(processed);
  }

  public send(item) {
    if (this.queue.isEmpty() && this.callback) {
      this.callback();
    }
    this.queue.push(item);
  }

  private share(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();

    return Object.assign(Object.create(null), {
      next: () => iterator.next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    });
  }

  private async *produce() {
    while (true) {
      while (!this.queue.isEmpty()) {
        const value = this.queue.shift();
        yield value;
      }
      await new Promise(i => {
        this.callback = i;
      });
    }
  }

  private async consume(input) {
    for await (const i of input) {
    }
  }

  private pipelineTransducers(transducers = []) {
    const pipeline = item => {
      for (const transducer of transducers) {
        const source = this.share(item);
        item = transducer(source);
      }
      return item;
    };
    return pipeline;
  }

  private async *testOutput(source) {
    for await (const item of source) {
      if (this.isTest) {
        yield item; // last yield in transducer pipeline causes update bug, https://github.com/angular/zone.js/issues/740
      }
    }
  }
}

export const createProducer = (messageQueueCapacity: number = 2048) => {
  if (!Number.isSafeInteger(messageQueueCapacity)) {
    throw new Error("Message queue capacity must be safe integer.");
  }

  let callback;
  const queue = new Deque(messageQueueCapacity);

  const producer = async function* _producer() {
    while (true) {
      while (!queue.isEmpty()) {
        const value = queue.shift();
        yield value;
        if (value && value.type === "DELETE") {
          return;
        }
      }
      await new Promise(resolve => {
        callback = resolve;
      });
      callback = null;
    }
  };
  producer.dispatch = action => {
    if (callback) {
      callback();
    }
    queue.push(action);
  };
  return producer;
};

export const pipe = (transducers = []) => (input, dispatch) => {
  for (const t of transducers) {
    input = t(input, dispatch);
  }
  return input;
};

export const run = async (producer, transducers = []) => {
  const main = pipe(transducers);
  const source = main(producer, producer.dispatch);
  for await (const i of source) {
    console.log("main", i);
  }
};
