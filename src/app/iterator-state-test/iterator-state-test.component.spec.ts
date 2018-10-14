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

  it("should have eventsProcessor", () => {
    expect(component.eventsProcessor).toBeTruthy();
  });

  it("should update the input text", async(async () => {
    try {
      const states = await testEvents(component, [
        [[component.textUpdated, "foo"], [["aText"]]],
        [[component.textReset], [["aText"]]],
        [[component.textUpdated, "bar"], [["aText"]]],
      ]);
      expect(states).toEqual([["foo"], ["[change me]"], ["bar"]]);
    } catch (error) {
      console.error(error);
    }
  }));
});
