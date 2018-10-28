import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IteratorStateTestComponent } from "./iterator-state-test.component";
import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import { createTestIterator, take } from "@local/IteratorStateManagement";
import { ListChildTestComponent } from "../list-child-test/list-child-test.component";
import { ListChildItemTestComponent } from "../list-child-item-test/list-child-item-test.component";

describe("IteratorStateTestComponent", () => {
  let fixture: ComponentFixture<IteratorStateTestComponent>;
  let component: IteratorStateTestComponent;
  // let eventsIterator: IEventsIterator;
  // let testIterator;

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
    // eventsIterator = await startTest(component);
    // testIterator = createTestIterator(eventsIterator);
    fixture.detectChanges();
  });

  // it("should create", () => {
  //   expect(component).toBeTruthy();
  // });

  // it("should have eventsIterator", () => {
  //   expect(component.eventsIterator).toBeTruthy();
  // });

  // it("should update the input text", async(async () => {
  //   await testIterator([
  //     null,
  //     component.textUpdated("a"),
  //     component.textUpdated("abc"),
  //     component.textUpdated("ab"),
  //   ]);
  //   expect(component.aText).toEqual("ab");
  // }));

  // it("should update the input text automatically", async(async () => {
  //   await testIterator([
  //     null,
  //     component.textUpdated("qwer"),
  //     component.textUpdated("asdf"),
  //     component.textUpdated("bingo"),
  //   ]);
  //   expect(component.aText).toEqual("[change me]");
  // }));

  // it("should update the input text automatically", async(async () => {
  //   await testIterator([
  //     null,
  //     component.textUpdated("qwer"),
  //     component.textUpdated("asdf"),
  //     component.textUpdated("bingo"),
  //     component.textUpdated("fgh"),
  //   ]);
  //   console.log("aaaaaaaaaa", component.aText);
  //   // expect(component.aText).toEqual("fgh");
  // }));
});
