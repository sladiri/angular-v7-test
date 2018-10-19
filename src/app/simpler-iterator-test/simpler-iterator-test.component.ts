import { Component, ViewChild } from "@angular/core";
import { createProducer, pipe, run } from "@local/EventsIterator";

@Component({
  selector: "app-simpler-iterator-test",
  templateUrl: "./simpler-iterator-test.component.html",
  styleUrls: ["./simpler-iterator-test.component.scss"],
})
export class SimplerIteratorTestComponent {
  producer = createProducer();
  aText = "[change me]";
  pointerUp = "NO";
  pointerDown = "NO";
  dataResponse = "[NO DATA]";
  @ViewChild("input")
  private readonly input;

  constructor() {
    document.addEventListener(
      "pointerdown",
      event => {
        this.producer.dispatch({ pointerdown: true });
      },
      false,
    );
    run(this.producer, [
      this.dummyTransducer,
      this.dummyTransducer2,
      this.dummyTransducer3,
    ]);
  }

  private async *dummyTransducer(input, dispatch) {
    for await (const item of input()) {
      console.log("dummyTransducer", item.type || item);
      if (item.type === "sladi") {
        continue;
      }
      yield item;
    }
  }

  private async *dummyTransducer2(input, dispatch) {
    for await (const item of input) {
      console.log("dummyTransducer2", item.type || item);
      yield item;
      dispatch({ type: "sladi" });
    }
  }

  private async *dummyTransducer3(input, dispatch) {
    for await (const item of input) {
      console.log("dummyTransducer3", item.type || item);
      yield item;
    }
  }
}
