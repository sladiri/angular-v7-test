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

export const generateDblClicks = (dblClickTime = 300, timeout = 1000) =>
  async function*(source, dispatch) {
    for await (const firstEvent of source) {
      // console.log("OUTER", firstEvent.type);
      if (firstEvent.type !== "pointerup") {
        yield firstEvent;
        continue;
      }

      const last = Date.now();
      for await (const secondEvent of source) {
        // console.log("INNER", secondEvent.type);
        if (secondEvent.type !== "pointerup") {
          yield secondEvent;
          continue;
        }
        const diff = Date.now() - last;
        // console.log("dbl?", diff);
        yield diff > dblClickTime
          ? secondEvent
          : { dblclick: true, type: "dblclick" };
        break;
      }
    }
  };

// #endregion
