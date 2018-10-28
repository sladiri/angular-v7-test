export interface IMessage {
  _type: string;
  [key: string]: any;
}

export type Dispatch = (item: object) => void;

export type Transducer<T extends IMessage> = (
  trandsducer: AsyncIterableIterator<T>,
  dispatch?: Dispatch,
) => AsyncIterableIterator<T>;

export interface IEventsIterator<T extends IMessage>
  extends AsyncIterableIterator<T> {
  dispatch: Dispatch;
  start(
    trandsducers?: Array<Transducer<T>>,
  ): Promise<void | AsyncIterableIterator<T>>;
  stop(): void;
}
