import { EventsIterator, Transducer } from "@local/EventsIterator";

export interface IIteratorStateManagement<T> {
  eventsIterator: EventsIterator<T>; // Testing API
  updateState: Transducer<T>;
}
