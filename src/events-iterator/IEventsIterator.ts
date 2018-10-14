export interface IEventsIterator {
  transducers: Array<(trandsducer: AsyncIterableIterator<any>) => void>;
  start(
    transducers: Array<(trandsducer: AsyncIterableIterator<any>) => void>,
  ): void;
  send(item: any): void;
}
