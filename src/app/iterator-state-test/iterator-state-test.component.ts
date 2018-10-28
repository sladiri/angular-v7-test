import { Component, ViewChild, OnInit } from "@angular/core";
import { Observable, Subject, fromEvent } from "rxjs";
import { map, tap } from "rxjs/operators";
import { prop } from "ramda";

import {
  IIteratorStateManagement,
  IteratorStateManagement,
} from "@local/IteratorStateManagement";

import { ListChildTestComponent } from "../list-child-test/list-child-test.component";

@Component({
  selector: "app-iterator-state-test",
  templateUrl: "./iterator-state-test.component.html",
  styleUrls: ["./iterator-state-test.component.scss"],
})
export class IteratorStateTestComponent implements OnInit {
  // Input
  readonly textUpdate$: Subject<EventTarget> = new Subject<EventTarget>();
  readonly textReset$: Subject<EventTarget> = new Subject<EventTarget>();
  readonly dataFetch$: Subject<EventTarget> = new Subject<EventTarget>();
  readonly randomItemUpdate$: Subject<EventTarget> = new Subject<EventTarget>();
  readonly itemClick$: Subject<EventTarget> = new Subject<EventTarget>();

  // Output
  readonly items$: Observable<any>;

  // Testing API
  readonly sm: IIteratorStateManagement<any>;

  private readonly state: any = Object.assign(Object.create(null), {
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

  @ViewChild(ListChildTestComponent)
  private readonly listChild: ListChildTestComponent;

  @ViewChild("input")
  private readonly input;

  // private generateFetchAction: IEventsIterator<IMessage> = new EventsIterator();

  constructor() {
    this.sm = new IteratorStateManagement(
      this.state,
      [
        fromEvent(document, "pointerdown").pipe(
          map(() => ({ pointerdown: true })),
        ),
        // TODO: optimise?
        fromEvent(document, "pointerup"),
        fromEvent(document, "pointerup").pipe(map(() => ({ pointerup: true }))),
        this.textUpdate$.pipe(map(this.textUpdated.bind(this))),
        this.textReset$.pipe(map(this.textReset.bind(this))),
        this.dataFetch$.pipe(map(this.dataFetched.bind(this))),
        this.randomItemUpdate$.pipe(map(this.randomItemUpdated.bind(this))),
        this.itemClick$.pipe(map(this.itemClicked.bind(this))),
      ],
      [this.updateState.bind(this)],
      this.nextActionPredicate.bind(this),
    );

    this.items$ = this.sm.state$.pipe(
      map(prop("listItems")),
      tap(x => {
        // console.log("tap items$", x.map(y => y.name));
      }),
    );

    //
    // this.changeDetectRef.detach();

    // TODO: Possible "threading" in eventsIterator?
    // TODO: Is it a good pattern?
    // this.generateFetchAction.start([
    //   asyncFilter(i => i.fetchedData),
    //   // filter(i => i.fetchedData),
    //   distinctUntilChanged((a, b) => a.fetchedData !== b.fetchedData),
    //   flatMapLatest(this.fetchData),
    //   // map(dataResponse => ({ dataResponse })),
    //   asyncMap(dataResponse => ({ dataResponse })),
    //   forEach(i => this.eventsIterator.dispatch(i)),
    //   // asyncTap(i => this.eventsIterator.dispatch(i)), // type error bug?
    // ]);
  }

  ngOnInit() {
    // this.eventsIterator.dispatch({}); // Initial render
    // Initialise children with full list to optimise change, but Angular can help us, see below in notifyStateUpdate
    // this.listChild.itemsUpdated(this.listItems);
    this.input.nativeElement.focus();
  }

  textUpdated(value) {
    return { aText: value };
  }

  textReset() {
    const input = this.input.nativeElement;
    input.value = "";
    input.focus();
    return { aText: null };
  }

  randomItemUpdated() {
    return { itemUpdated: true };
  }

  itemClicked([id, name]) {
    return { itemUpdated: id };
  }

  dataFetched() {
    const fetchedData = `${Math.random()}`;
    // const fetchedData = 42;
    // this.generateFetchAction.dispatch();
  }

  async *updateState(source) {
    const state = this.state;

    for await (const item of source) {
      // console.log("updateState", item);

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
        // If we make sure to not to change items, we can let Angular optimise re-renders
        // item = { listItemUpdate: { index, name } };
      }
      if (Number.isInteger(itemUpdated)) {
        const name = `${Math.random()}`;
        state.listItems[itemUpdated]["name"] = name;
      }

      yield item;
    }
  }

  private nextActionPredicate(item) {
    const state = this.state;

    if (state.aText === "bingo") {
      this.textReset$.next();
      return;
    }

    return item;
  }

  private fetchData() {
    return new Promise(resolve => {
      const val = `${Math.random()}`;
      const delay = Math.floor(Math.random() * (2000 - 100 + 1)) + 100;
      console.log("fetching with delay ...", val, delay);
      setTimeout(() => resolve(val), delay);
    });
  }
}
