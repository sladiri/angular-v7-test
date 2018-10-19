import { Component, ViewChild } from "@angular/core";
import { EventsIterator, EventsProcessor } from "@local/EventsIterator";
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
  implements IIteratorStateManagement<Object> {
  readonly eventsIterator: EventsIterator<Object> = new EventsProcessor();
  aText = "[change me]";
  pointerUp = "NO";
  pointerDown = "NO";
  dataResponse = "[NO DATA]";
  @ViewChild("input")
  private readonly input;

  constructor() {
    document.addEventListener(
      "pointerdown",
      this.eventsIterator.dispatch.bind(this.eventsIterator),
      false,
    );
    document.addEventListener(
      "pointerup",
      this.eventsIterator.dispatch.bind(this.eventsIterator),
      false,
    );
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
        this.eventsIterator.dispatch({ pointerup: true });
      },
      false,
    );
    this.eventsIterator.start([
      generateDblClicks(),
      this.dummyTransducer,
      this.generateFetchAction,
      this.updateState.bind(this),
    ]);
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
      setTimeout(() => {
        const val = Math.random();
        console.log("data done", val);
        resolve(val);
      }, 1000);
    });
    this.eventsIterator.dispatch({ fetchedData });
  }

  private async *generateFetchAction(source) {
    for await (const item of source) {
      if (!item.fetchedData) {
        yield item;
        continue;
      }
      console.log("fetchAction", item);
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

      yield;

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
}
