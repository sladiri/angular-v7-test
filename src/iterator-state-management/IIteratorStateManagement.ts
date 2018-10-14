import { IEventsIterator } from "@local/EventsIterator";

export interface IIteratorStateManagement {
  eventsProcessor: IEventsIterator;
  updateState(item: any): AsyncIterableIterator<any>;
}
