import { Component, ViewChild } from "@angular/core";
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
export class IteratorStateTestComponent implements IIteratorStateManagement {
  readonly eventsProcessor: IEventsIterator = new EventsIterator();
  aText = "[change me]";
  pointerUp = "NO";
  pointerDown = "NO";
  @ViewChild("input")
  private readonly input;

  constructor() {
    document.addEventListener(
      "pointerdown",
      this.eventsProcessor.send.bind(this.eventsProcessor),
      false,
    );
    document.addEventListener(
      "pointerup",
      this.eventsProcessor.send.bind(this.eventsProcessor),
      false,
    );
    document.addEventListener(
      "pointerdown",
      event => {
        this.eventsProcessor.send({ pointerdown: true });
      },
      false,
    );
    document.addEventListener(
      "pointerup",
      event => {
        this.eventsProcessor.send({ pointerup: true });
      },
      false,
    );
    this.eventsProcessor.start([
      generateDblClicks(),
      this.dummyTransducer,
      this.updateState.bind(this),
    ]);
  }

  textUpdated(value) {
    this.eventsProcessor.send({ aText: value });
  }

  textReset() {
    this.eventsProcessor.send({ aText: null });
    const input = this.input.nativeElement;
    input.value = "";
    input.focus();
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

      yield; // Testing API
    }
  }

  private async *dummyTransducer(source) {
    for await (const item of source) {
      // console.log("dummyTransducer", item.type || item);
      yield item;
    }
  }
}
