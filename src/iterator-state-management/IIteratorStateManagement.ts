import { Observable } from "rxjs";
import { IMessage, IEventsIterator } from "@local/EventsIterator";

export interface IIteratorStateManagement<
  State,
  Message extends IMessage = IMessage
> {
  state$: Observable<State>;
  hasNextAction$: Observable<boolean>;
  unsubscribe: () => void;
  // Testing API
  eventsIterator: IEventsIterator<Message>;
}
