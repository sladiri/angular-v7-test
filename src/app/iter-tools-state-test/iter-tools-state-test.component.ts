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
    this.eventsIterator.start([this.notifyStateUpdate.bind(this)]);
    merge(
      this.click$.pipe(map(this.clicked.bind(this))),
      this.stop$.pipe(
        tap(() => {
          console.log("stop from Rx", this.nap);
        }),
        map(x => ({ type: "DELETE" })),
      ),
    )
      .pipe(
        // tap(this.eventsIterator.dispatch.bind(this.eventsIterator)),
        tap(item => {
          console.log("click dispatch", this.nap);
          this.eventsIterator.dispatch(item);
        }),
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

  readonly stop$: Subject<boolean> = new Subject<boolean>();

  readonly nap: Array<Function> = [];

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

  private async updateState(item) {
    if (item.target) {
      this.state["counter"] += 1;
    }
    console.log("updateState done", item, this.state["counter"]);
  }

  private async *notifyStateUpdate(source) {
    for await (const item of source) {
      await this.updateState(item);
      this._state$.next(this.state);
      if (this.state.counter === 3) {
        console.log("auto action", this.state.counter);
        // this.click$.next(new EventTarget());
        this.nap.push(() => this.click$.next(new EventTarget()));
      }
    }
  }
}
