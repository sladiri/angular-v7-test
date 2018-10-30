export type Transducer<T> = (
  trandsducer: AsyncIterableIterator<T>,
  dispatch?: (item: object) => void,
) => AsyncIterableIterator<T>;

export interface IQueuedIterator<T extends object> {
  start(trandsducers: Array<Transducer<T>>): Promise<void>;
  stop(): void;
  dispatch(item: object): void;
  clearQueue(): void; // Testing API
}
