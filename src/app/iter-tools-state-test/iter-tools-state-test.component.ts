import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { prop } from "ramda";

import {
  IIteratorStateManagement,
  IteratorStateManagement,
} from "@local/IteratorStateManagement";

@Component({
  selector: "app-iter-tools-state-test",
  templateUrl: "./iter-tools-state-test.component.html",
  styleUrls: ["./iter-tools-state-test.component.scss"],
})
export class IterToolsStateTestComponent implements OnInit, OnDestroy {
  // Input
  readonly click$: Subject<EventTarget> = new Subject<EventTarget>();

  // Output
  readonly counter$: Observable<number>;
  readonly counter2$: Observable<string>;

  // Testing API
  readonly sm: IIteratorStateManagement<any>;

  private readonly state: any = Object.assign(Object.create(null), {
    counter: 0,
  });

  constructor() {
    this.sm = new IteratorStateManagement(
      this.state,
      [this.click$.pipe(map(IterToolsStateTestComponent.clicked))],
      [this.updateState.bind(this)],
      this.nextActionPredicate.bind(this),
    );

    this.counter$ = this.sm.state$.pipe(map(prop("counter")));
    this.counter2$ = this.sm.state$.pipe(
      map(prop("counter")),
      map((x: number) => x * 2),
      map(x => `[${x}-second]`),
    );
  }

  static async clicked(target: EventTarget) {
    // await new Promise(r => setTimeout(r, 100));
    return { target };
  }

  ngOnInit() {
    this.click$.next(new EventTarget());
    this.click$.next(new EventTarget());
    this.click$.next(new EventTarget());
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private async *updateState(source) {
    for await (const item of source) {
      if (item.target) {
        this.state["counter"] += 1;
      }

      yield item;
    }
  }

  private nextActionPredicate(item) {
    const state = this.state;

    if (state.counter === 3) {
      this.click$.next(new EventTarget());
      return;
    }
    if (state.counter === 10) {
      this.click$.next(new EventTarget());
      this.click$.next(new EventTarget());
      return;
    }
    return item;
  }
}
