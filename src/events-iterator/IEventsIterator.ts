export type Dispatch = (item: IMessage) => void;

export type Transducer = (
  trandsducer: AsyncIterableIterator<IMessage>,
  dispatch?: Dispatch,
) => AsyncIterableIterator<IMessage>;

export interface IMessage {
  type?: string;
  [key: string]: any;
}

export interface IEventsIterator extends AsyncIterableIterator<IMessage> {
  transducers: Array<Transducer>; // Testing API
  dispatch: Dispatch;
  start(
    trandsducers: Array<Transducer>,
    isTest?: boolean,
  ): Promise<void | AsyncIterableIterator<IMessage>>;
  stop(): void;
}
