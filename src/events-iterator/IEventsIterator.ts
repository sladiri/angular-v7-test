export interface IEventsIterator {
  transducers: Array<(trandsducer: AsyncIterableIterator<any>) => void>;
  start(
    transducers: Array<(trandsducer: AsyncIterableIterator<any>) => void>,
    isTest?: boolean,
  ): void;
  send(item: any): void;
}
