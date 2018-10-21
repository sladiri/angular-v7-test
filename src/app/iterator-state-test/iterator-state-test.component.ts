import { Component, ViewChild, ChangeDetectorRef, OnInit } from "@angular/core";
import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import {
  IIteratorStateManagement,
  generateDblClicks,
  latest,
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
    { id: 0, name: "placeholder 0" },
    { id: 1, name: "placeholder 1" },
    { id: 2, name: "placeholder 2" },
    { id: 3, name: "placeholder 3" },
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
      this.dummyTransducer,
      this.updateState.bind(this),
      this.notifyStateUpdate.bind(this),
      this.automaticNextActions.bind(this),
      this.dummyTransducer2,
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
      this._generateFetchAction.bind(this),
      this.updateState.bind(this),
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

  itemUpdated() {
    this.eventsIterator.dispatch({ itemUpdated: true });
  }

  async dataFetched() {
    const fetchedData = new Promise(resolve => {
      console.log("thinking ...");
      setTimeout(() => {
        const val = Math.random();
        console.log("thinking done", val);
        resolve(val);
      }, 2000);
    });
    this.generateFetchAction.dispatch({ fetchedData });
  }

  async *_generateFetchAction(source) {
    for await (const item of latest()(source)) {
      console.log("data item", item);
      this.eventsIterator.dispatch({ dataResponse: item });
    }
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
      if (itemUpdated) {
        const index = Math.floor(Math.random() * this.listItems.length);
        const name = `${Math.random()}`;
        this.listItems[index]["name"] = name;
        // If we make sure to not to change items, we can let Angular optimise re-renders
        // item = { listItemUpdate: { index, name } };
      }

      yield item;
    }
  }

  private async *dummyTransducer(source) {
    for await (const item of source) {
      // console.log("dummyTransducer", item.type || item);
      yield item;
    }
  }

  private async *dummyTransducer2(source) {
    for await (const item of source) {
      // console.log("dummyTransducer2", item.type || item);
      yield item;
    }
  }

  private async *notifyStateUpdate(source) {
    for await (const item of source) {
      this.changeDetectRef.detectChanges();

      // trackBy prevents re-render of all list items
      // if (item.listItemUpdate) {
      // this.listChild.itemUpdated(item.listItemUpdate);
      // this.listChild.itemsUpdated(JSON.parse(JSON.stringify(this.listItems)));
      // }
      this.listChild.itemsUpdated(this.listItems);

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
}
