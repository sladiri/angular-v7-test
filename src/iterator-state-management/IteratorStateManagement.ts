import { Observable, Subject, BehaviorSubject, merge } from "rxjs";
import { map, tap, takeUntil, filter } from "rxjs/operators";

import {
  IQueuedIterator,
  QueuedIterator,
  Transducer,
} from "@local/QueuedIterator";

import {
  IIteratorStateManagement,
  TOKEN_DELETE,
} from "./IIteratorStateManagement";

export class IteratorStateManagement<State, Message extends object>
  implements IIteratorStateManagement<State, Message> {
  // State Management
  private readonly state: State;
  private readonly _state$: Subject<State>;
  private readonly nextActionPredicate: () => boolean | void;
  private readonly immutableStateStream: boolean;

  // Output
  readonly state$: Observable<State>;

  // Testing API
  readonly eventsIterator = new QueuedIterator(TOKEN_DELETE);
  readonly hasNextAction$ = new Subject<boolean>();

  private readonly unsubscribe$ = new Subject<boolean>();

  constructor(
    state: State,
    // void: Some inputs just call actions on other components, but we allow to manage unsubscription here too
    observables: Array<Observable<Message | void>>,
    iterators: Array<Transducer<Message>>,
    nextActionPredicate?: () => boolean | void,
    immutableStateStream = false,
  ) {
    this.state = state;
    this.nextActionPredicate = nextActionPredicate;
    this.immutableStateStream = immutableStateStream || false;

    this._state$ = new BehaviorSubject<any>(this.state);
    this.state$ = this._state$.asObservable();

    this.eventsIterator.start([
      ...iterators,
      this.notifyStateUpdate.bind(this),
    ]);

    merge(...observables)
      .pipe(
        filter(IteratorStateManagement.filterUndefined),
        tap(this.eventsIterator.dispatch.bind(this.eventsIterator)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  private static filterUndefined(item: any): boolean {
    return item !== undefined;
  }

  unsubscribe(): void {
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
