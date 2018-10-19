import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IteratorStateTestComponent } from "./iterator-state-test.component";
import { testEvents } from "@local/IteratorStateManagement";

describe("IteratorStateTestComponent", () => {
  let component: IteratorStateTestComponent;
  let fixture: ComponentFixture<IteratorStateTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IteratorStateTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IteratorStateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have eventsIterator", () => {
    expect(component.eventsIterator).toBeTruthy();
  });

  it("should update the input text", async(async () => {
    expect(component.aText).toEqual("[change me]");
    component.textUpdated("a");
    component.textUpdated("abc");
    component.textUpdated("ab");
    // for await (const i of component.eventsIterator) {
    //   console.log("test", i);
    // }
    const states = await testEvents(component, [
      ["aText"],
      ["aText"],
      ["aText"],
    ]);
    expect(states).toEqual(["a", "abc", "ab"]);
  }));
});
