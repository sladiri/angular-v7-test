import { IEventsIterator, Transducer } from "@local/EventsIterator";

export interface IIteratorStateManagement {
  eventsIterator: IEventsIterator; // Testing API
  updateState: Transducer;
}
