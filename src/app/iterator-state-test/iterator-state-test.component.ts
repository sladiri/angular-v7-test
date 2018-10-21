import { Component, ViewChild, ChangeDetectorRef, OnInit } from "@angular/core";
import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import {
  IIteratorStateManagement,
  generateDblClicks,
} from "@local/IteratorStateManagement";

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
  @ViewChild("input")
  private readonly input;
  private generateFetchAction: IEventsIterator = new EventsIterator();

  constructor(private readonly changeDetectRef: ChangeDetectorRef) {
    this.eventsIterator.start([
      generateDblClicks(),
      this.dummyTransducer,
      this.updateState.bind(this),
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
    this.generateFetchAction.start([this._generateFetchAction.bind(this)]);
  }

  ngOnInit() {
    this.changeDetectRef.detach();
    this.changeDetectRef.detectChanges();
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

  private async *_generateFetchAction(source) {
    for await (const item of source) {
      if (item.fetchedData) {
        const dataResponse = await item.fetchedData;
        this.eventsIterator.dispatch({ dataResponse });
        continue;
      }
      yield item;
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

      this.changeDetectRef.detectChanges();
      yield item; // Testing API

      // automatic actions

      if (this.aText === "bingo") {
        this.textReset();
      }
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
}
