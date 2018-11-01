import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { prop } from "ramda";

import {
  IIteratorStateManagement,
  IteratorStateManagement,
} from "@local/IteratorStateManagement";

// #region Actions (reusable)
const clicked: () => object = () => {
  // await new Promise(r => setTimeout(r, 100));
  return { counter: true };
};
// #endregion

@Component({
  selector: "app-iter-tools-state-test",
  templateUrl: "./iter-tools-state-test.component.html",
  styleUrls: ["./iter-tools-state-test.component.scss"],
})
export class IterToolsStateTestComponent implements OnInit, OnDestroy {
  // #region Input
  readonly click$: Subject<object> = new Subject<object>();

  private readonly inputs = [this.click$.pipe(map(clicked))];
  // #endregion

  // #region Public testing API
  readonly state: any = Object.assign(Object.create(null), {
    counter: 0,
  });
  readonly stateManager: IIteratorStateManagement<
    any,
    object
  > = new IteratorStateManagement(
    this.state,
    this.inputs,
    [this.updateState.bind(this)],
    this.nextActionPredicate.bind(this),
  );
  // #endregion

  // #region Output
  readonly counter$: Observable<number> = this.stateManager.state$.pipe(
    map(prop("counter")),
  );
  readonly counter2$: Observable<string> = this.stateManager.state$.pipe(
    map(prop("counter")),
    map((x: number) => x * 2),
    map(x => `[${x}-second]`),
  );
  // #endregion

  ngOnInit() {
    this.click$.next();
    this.click$.next();
  }

  ngOnDestroy() {
    this.stateManager.unsubscribe();
  }

  private async *updateState(source) {
    const state = this.state;
    for await (const item of source) {
      const { counter } = item;
      if (counter) {
        state.counter += 1;
      }

      yield item;
    }
  }

  private nextActionPredicate() {
    const state = this.state;

    if (state.counter === 3) {
      this.click$.next();
      return true;
    }
    if (state.counter === 6) {
      this.click$.next();
      return true;
    }
    if (state.counter === 7) {
      this.click$.next();
      return true;
    }
    if (state.counter === 9) {
      setTimeout(() => {
        this.click$.next();
      }, 1000);
      return true;
    }
  }
}
