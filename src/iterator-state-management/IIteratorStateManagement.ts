import { Observable } from "rxjs";
import { IMessage, IEventsIterator } from "@local/EventsIterator";

export const TOKEN_AUTOMATIC_ACTION: IMessage = { type: "AUTOMATIC_ACTION" };

export interface IIteratorStateManagement<State, Message = IMessage> {
  state$: Observable<State>;
  unsubscribe: () => void;
  eventsIterator: IEventsIterator<Message>;
}
