import { IIteratorStateManagement } from "@local/IteratorStateManagement";
import { lensPath, view } from "ramda/es";

export const testEvents = async (
  context: IIteratorStateManagement<Object>,
  statePaths = [],
) => {
  const states = statePaths.map(async path => {
    const { value: state } = await context.eventsIterator.next();
    return view(lensPath(path), state);
  });
  const result = await Promise.all(states);
  return result;
};

// #region events

export const generateDblClicks = (dblClickTime = 300, timeout = 1000) =>
  async function*(source) {
    for await (const firstEvent of source) {
      if (firstEvent.type !== "pointerup") {
        yield firstEvent;
        continue;
      }

      let last = Date.now();
      yield firstEvent;

      for await (const secondEvent of source) {
        if (secondEvent.type !== "pointerup") {
          yield secondEvent;
          continue;
        }

        const diff = Date.now() - last;

        if (diff > timeout) {
          // user clicked three times by accident
          last = Date.now();
          continue;
        }

        if (diff < dblClickTime) {
          yield Object.assign(Object.create(null), {
            dblclick: true,
            event: secondEvent,
          });
        } else {
          yield secondEvent;
        }
        break;
      }
    }
  };

// #endregion
