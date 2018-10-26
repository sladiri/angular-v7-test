import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IteratorStateTestComponent } from "./iterator-state-test.component";
import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import { startTest, take } from "@local/IteratorStateManagement";
import { ListChildTestComponent } from "../list-child-test/list-child-test.component";
import { ListChildItemTestComponent } from "../list-child-item-test/list-child-item-test.component";

describe("IteratorStateTestComponent", () => {
  let fixture: ComponentFixture<IteratorStateTestComponent>;
  let component: IteratorStateTestComponent;
  let eventsIterator: IEventsIterator;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IteratorStateTestComponent,
        ListChildTestComponent,
        ListChildItemTestComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(IteratorStateTestComponent);
    component = fixture.componentInstance;
    eventsIterator = await startTest(component);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have eventsIterator", () => {
    expect(component.eventsIterator).toBeTruthy();
  });

  it("should update the input text", async(async () => {
    component.textUpdated("a");
    component.textUpdated("abc");
    component.textUpdated("ab");
    eventsIterator.dispatch({ type: "DELETE" });
    for await (const item of eventsIterator) {
    }
    expect(component.aText).toEqual("ab");
  }));

  it("should update the input text automatically", async(async () => {
    component.textUpdated("qwer");
    component.textUpdated("asdf");
    component.textUpdated("bingo");
    for await (const item of take(5)(eventsIterator)) {
      // take 5 events = initial + 3 given + 1 automatic
    }
    expect(component.aText).toEqual("[change me]");
  }));

  it("should update the input text automatically - split", async(async () => {
    component.textUpdated("qwer");
    component.textUpdated("asdf");
    component.textUpdated("bingo");
    for await (const item of take(4)(EventsIterator.share(eventsIterator))) {
    }
    expect(component.aText).toEqual("bingo");
    for await (const item of take(1)(EventsIterator.share(eventsIterator))) {
    }
    expect(component.aText).toEqual("[change me]");
  }));
});
