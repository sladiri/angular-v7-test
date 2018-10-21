import { IIteratorStateManagement } from "@local/IteratorStateManagement";
import { IMessage, EventsIterator } from "@local/EventsIterator";

export const startTest = (
  component: IIteratorStateManagement,
): Promise<void | AsyncIterableIterator<IMessage>> => {
  const eventsIterator = new EventsIterator();
  const transducers = component.eventsIterator.transducers;
  component.eventsIterator = eventsIterator;
  return component.eventsIterator.start(transducers, true);
};

// #regino iterators

export const take = (n: number) =>
  async function* _take(source) {
    if (n <= 0) {
      return;
    }
    for await (const item of source) {
      yield item;
      n -= 1;
      if (n <= 0) {
        break;
      }
    }
  };

export const filter = (predicate: (item: IMessage) => boolean) =>
  async function* _filter(source) {
    for await (const item of source) {
      if (predicate(item)) {
        yield item;
      }
    }
  };

// #endregion

// #region events

export const generateDblClicks = (dblClickTime = 300) =>
  async function*(source) {
    let last;
    let firstClick = false;

    for await (const item of source) {
      if (item.type !== "pointerup") {
        yield item;
        continue;
      }

      if (!firstClick) {
        last = Date.now();
        firstClick = true;
        yield item;
          continue;
        }

      if (firstClick) {
        const diff = Date.now() - last;
        last = Date.now();
        if (diff > dblClickTime) {
          yield item;
          continue;
        }

        firstClick = false;
        yield { dblclick: true, type: "--" };
      }
    }
  };

// #endregion
