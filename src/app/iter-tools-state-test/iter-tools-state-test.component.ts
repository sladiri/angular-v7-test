import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subject, BehaviorSubject, merge } from "rxjs";
import { takeUntil, tap, map } from "rxjs/operators";
import { EventsIterator } from "@local/EventsIterator";
import { prop } from "ramda";

@Component({
  selector: "app-iter-tools-state-test",
  templateUrl: "./iter-tools-state-test.component.html",
  styleUrls: ["./iter-tools-state-test.component.scss"],
})
export class IterToolsStateTestComponent implements OnInit, OnDestroy {
  constructor() {
    this.eventsIterator.start([this.updateState.bind(this)]);
    merge(this.click$.pipe(map(this.clicked.bind(this))))
      .pipe(
        tap(this.eventsIterator.dispatch.bind(this.eventsIterator)),
        takeUntil(this.unsubscribe),
      )
      .subscribe();
  }

  private readonly unsubscribe: Subject<boolean> = new Subject<boolean>();
  private readonly state = Object.assign(Object.create(null), {
    counter: 0,
  });
  private readonly _state$: Subject<any> = new BehaviorSubject<any>(this.state);
  private readonly state$: Observable<any> = this._state$
    .asObservable()
    .pipe(tap(() => {}));

  readonly eventsIterator = new EventsIterator();

  readonly click$: Subject<EventTarget> = new Subject<EventTarget>();

  readonly counter$: Observable<number> = this.state$.pipe(
    map(prop("counter")),
  );

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribe.next(true);
  }

  async clicked(target: EventTarget) {
    // await new Promise(r => setTimeout(r, 500));
    return { target };
  }

  private async *updateState(source) {
    for await (const item of source) {
      if (item.target) {
        this.state["counter"] += 1;
      }
    }
  }

  private async *notifyStateUpdate(source) {
    for await (const item of source) {
      this._state$.next(this.state);
    }
  }
}
