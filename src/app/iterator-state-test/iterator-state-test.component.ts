import { Component, ViewChild, ChangeDetectorRef, OnInit } from "@angular/core";
import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import {
  IIteratorStateManagement,
  generateDblClicks,
  filter,
  flatMapLatest,
  distinctUntilChanged,
  map,
  forEach,
} from "@local/IteratorStateManagement";
import { ListChildTestComponent } from "../list-child-test/list-child-test.component";

@Component({
  selector: "app-iterator-state-test",
  templateUrl: "./iterator-state-test.component.html",
  styleUrls: ["./iterator-state-test.component.scss"],
})
export class IteratorStateTestComponent
  implements IIteratorStateManagement, OnInit {
  eventsIterator: IEventsIterator = new EventsIterator(); // Testing API
  aText = "[change me]";
  pointerUp = "NO";
  pointerDown = "NO";
  dataResponse = "[NO DATA]";
  listItems = [
    { id: 0, name: "placeholder_0" },
    { id: 1, name: "placeholder_1" },
    { id: 2, name: "placeholder_2" },
    { id: 3, name: "placeholder_3" },
  ];
  @ViewChild(ListChildTestComponent)
  listChild: ListChildTestComponent;
  @ViewChild("input")
  private readonly input;
  private generateFetchAction: IEventsIterator = new EventsIterator();

  constructor(private readonly changeDetectRef: ChangeDetectorRef) {
    this.changeDetectRef.detach();
    this.eventsIterator.start([
      generateDblClicks(),
      // this.dummyTransducer,
      this.updateState.bind(this),
      this.notifyStateUpdate.bind(this),
      this.automaticNextActions.bind(this),
      // this.dummyTransducer2,
    ]);
    document.addEventListener(
      "pointerdown",
      event => {
        this.eventsIterator.dispatch({ pointerdown: true });
      },
      false,
    );
    document.addEventListener(
      "pointerup",
      event => {
        this.eventsIterator.dispatch(event);
        this.eventsIterator.dispatch({ pointerup: true });
      },
      false,
    );
    // TODO: Possible "threading" in eventsIterator?
    // TODO: Is it a good pattern?
    this.generateFetchAction.start([
      filter(i => i.fetchedData),
      distinctUntilChanged((a, b) => a.fetchedData !== b.fetchedData),
      flatMapLatest(this.fetchData),
      map(dataResponse => ({ dataResponse })),
      forEach(i => this.eventsIterator.dispatch(i)),
    ]);
  }

  ngOnInit() {
    this.eventsIterator.dispatch({}); // Initial render
    // Initialise children with full list to optimise change, but Angular can help us, see below in notifyStateUpdate
    // this.listChild.itemsUpdated(this.listItems);
  }

  textUpdated(value) {
    this.eventsIterator.dispatch({ aText: value });
  }

  textReset() {
    this.eventsIterator.dispatch({ aText: null });
    const input = this.input.nativeElement;
    input.value = "";
    input.focus();
  }

  randomItemUpdated() {
    this.eventsIterator.dispatch({ itemUpdated: true });
  }

  itemClicked([id, name]) {
    this.eventsIterator.dispatch({ itemUpdated: id });
  }

  dataFetched() {
    const fetchedData = `${Math.random()}`;
    // const fetchedData = 42;
    this.generateFetchAction.dispatch({ fetchedData });
  }

  async *updateState(source) {
    for await (const item of source) {
      const { aText } = item;
      if (typeof aText === "string") {
        this.aText = aText;
      }
      if (aText === null) {
        this.aText = "[change me]";
      }

      const { pointerdown, pointerup, dblclick } = item;
      if (pointerdown) {
        this.pointerDown = "YES";
      } else {
        this.pointerDown = "NO";
      }

      if (pointerup) {
        this.pointerUp = "YES";
      } else {
        this.pointerUp = "NO";
      }

      if (dblclick) {
        this.aText = this.aText === "foo" ? "bar" : "foo";
      }

      const { dataResponse } = item;
      if (dataResponse) {
        this.dataResponse = `${dataResponse}`;
      }

      const { itemUpdated } = item;
      if (itemUpdated === true) {
        const index = Math.floor(Math.random() * this.listItems.length);
        const name = `${Math.random()}`;
        this.listItems[index]["name"] = name;
        // If we make sure to not to change items, we can let Angular optimise re-renders
        // item = { listItemUpdate: { index, name } };
      }
      if (Number.isInteger(itemUpdated)) {
        const name = `${Math.random()}`;
        this.listItems[itemUpdated]["name"] = name;
      }

      yield item;
    }
  }

  private async *dummyTransducer(source) {
    for await (const item of source) {
      console.log("dummyTransducer", item.type || item);
      yield item;
    }
  }

  private async *dummyTransducer2(source) {
    for await (const item of source) {
      console.log("dummyTransducer2", item.type || item);
      yield item;
    }
  }

  private async *notifyStateUpdate(source) {
    let items;
    for await (const item of source) {
      this.changeDetectRef.detectChanges();

      // trackBy prevents re-render of all list items
      // if (item.listItemUpdate) {
      // this.listChild.itemUpdated(item.listItemUpdate);
      // this.listChild.itemsUpdated(JSON.parse(JSON.stringify(this.listItems)));
      // }
      const newitems = JSON.stringify(this.listItems);
      if (!items || items !== newitems) {
        this.listChild.itemsUpdated(this.listItems);
        items = newitems;
      }

      yield item;
    }
  }

  private async *automaticNextActions(source) {
    for await (const item of source) {
      if (this.aText === "bingo") {
        this.textReset();
      }
      yield item;
    }
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
