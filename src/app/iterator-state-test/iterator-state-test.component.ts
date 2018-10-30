import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { Observable, Subject, fromEvent, merge } from "rxjs";
import { map, tap, switchMap } from "rxjs/operators";
import { prop } from "ramda";

import {
  IIteratorStateManagement,
  IteratorStateManagement,
} from "@local/IteratorStateManagement";

import { ListChildTestComponent } from "../list-child-test/list-child-test.component";

// #region Actions (reusable)
const fetchData = () =>
  new Promise(resolve => {
    const val = `${Math.random()}`;
    const delay = Math.floor(Math.random() * (2000 - 200 + 1)) + 200;
    console.log("fetching with delay ...", val, delay);
    setTimeout(() => resolve(val), delay);
  });

const textUpdated: (v: string) => object = value => {
  return { aText: value };
};

const textReset: (v: void) => object = () => {
  return { aText: null };
};

const randomItemUpdated: (v: void) => object = () => {
  return { itemUpdated: true };
};

const itemClicked: (v: Array<any>) => object = ([id, name]) => {
  return { itemUpdated: id };
};

const dataFetched: (v: string) => object = fetchedData => {
  return { dataResponse: fetchedData };
};
// #endregion

@Component({
  selector: "app-iterator-state-test",
  templateUrl: "./iterator-state-test.component.html",
  styleUrls: ["./iterator-state-test.component.scss"],
})
export class IteratorStateTestComponent implements OnInit, OnDestroy {
  // #region Input
  readonly textUpdate$: Subject<string> = new Subject<string>();
  readonly textReset$: Subject<void> = new Subject<void>();
  readonly dataFetch$: Subject<string> = new Subject<string>();
  readonly randomItemUpdate$: Subject<void> = new Subject<void>();
  readonly itemClick$: Subject<Array<any>> = new Subject<Array<any>>();

  private readonly inputs = [
    // TODO: try to use iterator (eg. genDblClick)
    fromEvent(document, "pointerdown").pipe(map(() => ({ pointerdown: true }))),
    // TODO: remove duplicate with Rx operator
    fromEvent(document, "pointerup").pipe(),
    fromEvent(document, "pointerup").pipe(map(() => ({ pointerup: true }))),
    this.textUpdate$.pipe(map(textUpdated)),
    this.textReset$.pipe(
      tap(this.textReset.bind(this)),
      map(textReset),
    ),
    this.dataFetch$.pipe(
      switchMap(fetchData),
      map(dataFetched),
    ),
    this.randomItemUpdate$.pipe(map(randomItemUpdated)),
    this.itemClick$.pipe(map(itemClicked)),
    merge(this.randomItemUpdate$, this.itemClick$).pipe(
      tap(() => this.listChild.updates$.next(null)),
    ) as Observable<void>,
  ];
  // #endregion

  // #region Public testing API
  readonly state: any = Object.assign(Object.create(null), {
    aText: "[change me]",
    pointerUp: "NO",
    pointerDown: "NO",
    dataResponse: "[NO DATA]",
    listItems: [
      { id: 0, name: "placeholder_0" },
      { id: 1, name: "placeholder_1" },
      { id: 2, name: "placeholder_2" },
      { id: 3, name: "placeholder_3" },
    ],
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
  readonly items$: Observable<any> = this.stateManager.state$.pipe(
    map(prop("listItems")),
    map((items: Array<any>) => [...items]),
  );

  @ViewChild("input")
  private readonly input;

  @ViewChild(ListChildTestComponent)
  private readonly listChild: ListChildTestComponent;
  // #endregion

  constructor(private readonly changeDetectRef: ChangeDetectorRef) {}

  ngOnInit() {
    // Optional controlled render
    this.changeDetectRef.detach();
    this.changeDetectRef.detectChanges();

    this.input.nativeElement.focus();

    this.textUpdate$.next("ngOnInit");
    this.textUpdate$.next("ngOnInit2");
    this.randomItemUpdate$.next();
  }

  ngOnDestroy() {
    this.stateManager.unsubscribe();
  }

  textReset() {
    const input = this.input.nativeElement;
    input.value = "";
    input.focus();
  }

  async *updateState(source) {
    const state = this.state;

    for await (const item of source) {
      const { aText } = item;
      if (typeof aText === "string") {
        state.aText = aText;
      }
      if (aText === null) {
        state.aText = "[change me]";
      }

      const { pointerdown, pointerup, dblclick } = item;
      if (pointerdown) {
        state.pointerDown = "YES";
      } else {
        state.pointerDown = "NO";
      }

      if (pointerup) {
        state.pointerUp = "YES";
      } else {
        state.pointerUp = "NO";
      }

      if (dblclick) {
        state.aText = state.aText === "foo" ? "bar" : "foo";
      }

      const { dataResponse } = item;
      if (dataResponse) {
        state.dataResponse = `${dataResponse}`;
      }

      const { itemUpdated } = item;
      if (itemUpdated === true) {
        const index = Math.floor(Math.random() * state.listItems.length);
        const name = `${Math.random()}`;
        state.listItems[index]["name"] = name;
      }
      if (Number.isInteger(itemUpdated)) {
        const name = `${Math.random()}`;
        state.listItems[itemUpdated]["name"] = name;
      }

      this.changeDetectRef.detectChanges();
      yield item;
    }
  }

  private nextActionPredicate() {
    const state = this.state;

    if (state.aText === "bingo") {
      this.textReset$.next();
      return true;
    }
  }
}
