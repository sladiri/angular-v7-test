import { Observable } from "rxjs";
import { IQueuedIterator } from "@local/QueuedIterator";

export interface IMessage {
  _type: string;
  [key: string]: any;
}

export interface IIteratorStateManagement<
  State,
  Message extends object & IMessage = IMessage
> {
  state$: Observable<State>;
  hasNextAction$: Observable<boolean>;
  unsubscribe: () => void;
  // Testing API
  eventsIterator: IQueuedIterator<Message>;
}

export const TOKEN_DELETE: IMessage = Object.assign(Object.create(null), {
  _type: "DELETE",
});
