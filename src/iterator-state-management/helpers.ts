import { asyncTakeWhile } from "iter-tools";
import { TOKEN_AUTOMATIC_ACTION } from "./IIteratorStateManagement";
import { IMessage } from "@local/EventsIterator";

// #region testing

const isAutomaticAction = (item: IMessage) =>
  item && item.type === TOKEN_AUTOMATIC_ACTION.type;

const testActions = async (
  source: AsyncIterableIterator<any>,
  actionsCount: number,
): Promise<void> => {
  let i = actionsCount;
  for await (const item of asyncTakeWhile(
    _item => i > 1 || isAutomaticAction(_item),
    source,
  )) {
    if (isAutomaticAction(item)) {
      continue;
    }
    i -= 1;
  }
};

export const createTestIterator = (source: AsyncIterableIterator<any>) => (
  actionsCount: number,
) => testActions(source, actionsCount);

// #endgregion

// #region iterators

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

export const map = (mapper: (item: any) => any) =>
  async function* _filter(source) {
    for await (const item of source) {
      const result = mapper(item);
      yield result;
    }
  };

export const filter = (predicate: (item: any) => boolean) =>
  async function* _filter(source) {
    for await (const item of source) {
      if (predicate(item)) {
        yield item;
      }
    }
  };

export const distinctUntilChanged = (
  areDistinct = (a: any, b: any) => a !== b,
) => {
  let initial = Object.create(null);
  return async function* _distinctUntilChanged(source) {
    for await (const item of source) {
      if (areDistinct(initial, item)) {
        initial = item;
        yield item;
      }
    }
  };
};

export const forEach = (task = (i: any) => {}) => {
  return async function* _forEach(source) {
    for await (const item of source) {
      await task(item);
      yield item;
    }
  };
};

const peek = async function* _peek(iterable) {
  const iter = iterable[Symbol.asyncIterator]();
  let result;
  try {
    let next = iter.next();
    while (true) {
      result = await next;
      if (result.done) {
        return result.value;
      }
      yield [result.value, (next = iter.next())];
    }
  } finally {
    if (!(result && result.done)) {
      iter.return();
    }
  }
};

export const flatMapLatest = fn =>
  async function* _flatMapLatest(source) {
    const cancel = {};
    for await (const [value, next] of peek(source)) {
      const result = await Promise.race([fn(value), next.then(() => cancel)]);
      if (result !== cancel) {
        yield result;
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
