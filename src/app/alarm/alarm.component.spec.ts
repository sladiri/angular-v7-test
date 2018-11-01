import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AlarmComponent } from "./alarm.component";
import { testActions } from "@local/IteratorStateManagement";

describe("AlarmComponent", () => {
  let component: AlarmComponent;
  let fixture: ComponentFixture<AlarmComponent>;
  let waitForActions: (
    actions: Array<Function | Promise<void>>,
  ) => Promise<void>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AlarmComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.stateManager.eventsIterator.clearQueue(); // Clear actions queued in onInit
    waitForActions = testActions(component.stateManager);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should unlock", async(async () => {
    await waitForActions([
      () => component.testInput$.next({ tagContact: "keypad" } as object),
    ]);
    component.testInput$.next({ keypadButton: "disarm" } as object);
    await new Promise(r => setTimeout(r, 501));
    await waitForActions([
      () => component.testInput$.next({ keypadButton: "disarm" } as object),
      () => component.testInput$.next({ tagContact: "access" } as object),
    ]);
    expect(component.state.locked).toEqual(false);
  }));

  it("should lock", async(async () => {
    await waitForActions([
      () => component.testInput$.next({ tagContact: "keypad" } as object),
    ]);
    component.testInput$.next({ keypadButton: "arm" } as object);
    await new Promise(r => setTimeout(r, 501));
    await waitForActions([
      () => component.testInput$.next({ keypadButton: "arm" } as object),
    ]);
    expect(component.state.locked).toEqual(true);
  }));
});
