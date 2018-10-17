import { IIteratorStateManagement } from "@local/IteratorStateManagement";
import { lensPath, view } from "ramda/es";

export const testEvents = (context: IIteratorStateManagement, actions = []) =>
  new Promise((resolve, reject) => {
    const transducers = [
      ...context.eventsProcessor.transducers,
      async function*(source) {
        const states = [];
        let i = 0;
        for await (const item of source) {
          const [, paths] = actions[i];
          states.push(paths.map(p => view(lensPath(p), context)));
          if (states.length === actions.length) {
            break;
          }
          i += 1;
        }
        resolve(states);
      },
    ];
    context.eventsProcessor.start(transducers, true);
    for (const [[action, ...params]] of actions) {
      action.apply(context, params);
    }
  });

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
