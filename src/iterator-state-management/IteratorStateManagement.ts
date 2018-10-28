import { Observable, Subject, BehaviorSubject, merge } from "rxjs";
import { tap, takeUntil } from "rxjs/operators";

import {
  IEventsIterator,
  EventsIterator,
  Transducer,
} from "@local/EventsIterator";

import {
  IIteratorStateManagement,
  TOKEN_AUTOMATIC_ACTION,
} from "./IIteratorStateManagement";

export class IteratorStateManagement<State, Message>
  implements IIteratorStateManagement<State, Message> {
  private readonly unsubscribe$: Subject<boolean> = new Subject<boolean>();
  private readonly state: State;
  private readonly _state$: Subject<State>;
  private readonly nextActionPredicate: (item: Message) => Message | void;
  private readonly immutableStateStream: boolean;

  readonly state$: Observable<State>;

  // Testing API
  readonly eventsIterator: IEventsIterator<Message>;

  constructor(
    state: State,
    observables: Array<Observable<any>>,
    iterators: Array<Transducer<Message>>,
    nextActionPredicate?: (item: Message) => Message | void,
    immutableStateStream?: boolean,
  ) {
    this.state = state;
    this._state$ = new BehaviorSubject<any>(this.state);
    this.state$ = this._state$.asObservable();

    this.eventsIterator = new EventsIterator();
    this.nextActionPredicate = nextActionPredicate;
    this.immutableStateStream = immutableStateStream || false;
    this.eventsIterator.start([
      ...iterators,
      this.notifyStateUpdate.bind(this),
    ]);

    merge(...observables)
      .pipe(
        tap(this.eventsIterator.dispatch.bind(this.eventsIterator)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  unsubscribe() {
    this.unsubscribe$.next(true);
  }

  private async *notifyStateUpdate(source) {
    for await (const item of source) {
      // console.log("notifyStateUpdate", item);
      const output = this.immutableStateStream
        ? JSON.parse(JSON.stringify(this.state))
        : this.state;
      this._state$.next(output);
      if (!this.nextActionPredicate) {
        yield item;
        continue;
      }
      const nextItem = this.nextActionPredicate(item);
      const hasNextAction = nextItem === undefined;
      yield hasNextAction ? TOKEN_AUTOMATIC_ACTION : nextItem;
    }
  }
}
