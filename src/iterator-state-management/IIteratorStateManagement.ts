import { Observable } from "rxjs";
import { IQueuedIterator } from "@local/QueuedIterator";

export interface IIteratorStateManagement<State, Message extends object> {
  state$: Observable<State>;
  unsubscribe: () => void;
  // Testing API
  hasNextAction$: Observable<boolean>;
  eventsIterator: IQueuedIterator<Message>;
}

export const TOKEN_DELETE: object = { _type: "DELETE" };
