export interface IMessage {
  _type: string;
  [key: string]: any;
}

export type Transducer<T extends IMessage> = (
  trandsducer: AsyncIterableIterator<T>,
  dispatch?: (item: object) => void,
) => AsyncIterableIterator<T>;

export interface IQueuedIterator<T extends IMessage> {
  start(trandsducers: Array<Transducer<T>>): Promise<void>;
  stop(): void;
  dispatch(item: object): void;
  clearQueue(): void; // Testing API
}
