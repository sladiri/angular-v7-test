export type EventsIterator<T> = IEventsIterator<T> & AsyncIterableIterator<T>;

export type Dispatch<T> = (item: T) => void;

export type Transducer<T> = (
  trandsducer: AsyncIterableIterator<T>,
  dispatch?: Dispatch<T>,
) => void;

export interface IEventsIterator<T> {
  dispatch: Dispatch<T>;
  start(transducers: Array<Transducer<T>>): void;
  stop(): void;
}
