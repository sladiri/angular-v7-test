export interface IMessage extends Object {
  type?: string;
  [key: string]: any;
}

export type Dispatch<T extends IMessage> = (item: T) => void;

export type Transducer<T extends IMessage> = (
  trandsducer: AsyncIterableIterator<T>,
  dispatch?: Dispatch<T>,
) => AsyncIterableIterator<T>;

export interface IEventsIterator<T extends IMessage>
  extends AsyncIterableIterator<T> {
  dispatch: Dispatch<T>;
  start(
    trandsducers?: Array<Transducer<T>>,
  ): Promise<void | AsyncIterableIterator<T>>;
  stop(): void;
}
