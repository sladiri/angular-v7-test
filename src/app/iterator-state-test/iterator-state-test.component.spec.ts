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
        [[component.textUpdated, "a"], [["aText"]]],
        [[component.textUpdated, "ab"], [["aText"]]],
        [[component.textUpdated, "abc"], [["aText"]]],
      ]);
      expect(states).toEqual([["a"], ["ab"], ["abc"]]);
    } catch (error) {
      console.error(error);
    }
  }));
});
