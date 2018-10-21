import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IteratorStateTestComponent } from "./iterator-state-test.component";
import { EventsIterator, IMessage } from "@local/EventsIterator";
import { startTest, take } from "@local/IteratorStateManagement";

describe("IteratorStateTestComponent", () => {
  let source: AsyncIterableIterator<IMessage>;
  let component: IteratorStateTestComponent;
  let fixture: ComponentFixture<IteratorStateTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IteratorStateTestComponent],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(IteratorStateTestComponent);
    component = fixture.componentInstance;
    source = (await startTest(component)) as AsyncIterableIterator<IMessage>;
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
    component.eventsIterator.dispatch({ type: "DELETE" });
    for await (const item of source) {
    }
    expect(component.aText).toEqual("ab");
  }));

  it("should update the input text automatically", async(async () => {
    component.textUpdated("qwer");
    component.textUpdated("asdf");
    component.textUpdated("bingo");
    for await (const item of take(4)(source)) {
    }
    expect(component.aText).toEqual("[change me]");
  }));

  it("should update the input text automatically - split", async(async () => {
    component.textUpdated("qwer");
    component.textUpdated("asdf");
    component.textUpdated("bingo");
    for await (const item of take(3)(EventsIterator.share(source))) {
    }
    expect(component.aText).toEqual("bingo");
    for await (const item of take(1)(EventsIterator.share(source))) {
    }
    expect(component.aText).toEqual("[change me]");
  }));
});
