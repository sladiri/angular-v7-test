import { Observable, Subject, BehaviorSubject, merge } from "rxjs";
import { map, tap, takeUntil } from "rxjs/operators";

import {
  IEventsIterator,
  EventsIterator,
  Transducer,
  IMessage,
} from "@local/EventsIterator";

import { IIteratorStateManagement } from "./IIteratorStateManagement";

export class IteratorStateManagement<State, Message extends IMessage>
  implements IIteratorStateManagement<State, Message> {
  private readonly unsubscribe$: Subject<boolean>;
  private readonly state: State;
  private readonly _state$: Subject<State>;
  private readonly nextActionPredicate: () => boolean | void;
  private readonly immutableStateStream: boolean;

  readonly state$: Observable<State>;

  // Testing API
  readonly eventsIterator: IEventsIterator<Message>;
  readonly hasNextAction$: Subject<boolean>;

  constructor(
    state: State,
    observables: Array<Observable<any>>,
    iterators: Array<Transducer<Message>>,
    nextActionPredicate?: () => boolean | void,
    immutableStateStream?: boolean,
  ) {
    this.unsubscribe$ = new Subject<boolean>();
    this.state = state;
    this._state$ = new BehaviorSubject<any>(this.state);
    this.state$ = this._state$.asObservable();

    this.hasNextAction$ = new Subject<boolean>();

    this.eventsIterator = new EventsIterator();
    this.nextActionPredicate = nextActionPredicate;
    this.immutableStateStream = immutableStateStream || false;
    this.eventsIterator.start([
      ...iterators,
      this.notifyStateUpdate.bind(this),
    ]);

    merge(...observables)
      .pipe(
        map(x => (x === undefined ? Object.create(null) : x)), // Just calling actions on other components
        tap(this.eventsIterator.dispatch.bind(this.eventsIterator)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  unsubscribe() {
    this.unsubscribe$.next(true);
  }

  private async *notifyStateUpdate(source: AsyncIterable<Message>) {
    for await (const item of source) {
      const output = this.immutableStateStream
        ? (JSON.parse(JSON.stringify(this.state)) as State)
        : this.state;
      this._state$.next(output);

      const hasNextAction =
        !!this.nextActionPredicate && !!this.nextActionPredicate();
      this.hasNextAction$.next(hasNextAction);

      yield item;
    }
  }
}
