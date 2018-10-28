import { Observable } from "rxjs";
import { IMessage, IQueuedIterator } from "@local/QueuedIterator";

export interface IIteratorStateManagement<
  State,
  Message extends IMessage = IMessage
> {
  state$: Observable<State>;
  hasNextAction$: Observable<boolean>;
  unsubscribe: () => void;
  // Testing API
  eventsIterator: IQueuedIterator<Message>;
}
