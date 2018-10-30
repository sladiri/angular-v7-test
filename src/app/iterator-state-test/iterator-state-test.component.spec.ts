import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { testActions } from "@local/IteratorStateManagement";

import { IteratorStateTestComponent } from "./iterator-state-test.component";

import { ListChildTestComponent } from "../list-child-test/list-child-test.component";
import { ListChildItemTestComponent } from "../list-child-item-test/list-child-item-test.component";

describe("IteratorStateTestComponent", () => {
  let fixture: ComponentFixture<IteratorStateTestComponent>;
  let component: IteratorStateTestComponent;
  let waitForActions: (actions: Array<Function>) => Promise<void>;

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
    fixture.detectChanges();
    component.stateManager.eventsIterator.clearQueue(); // Clear actions queued in onInit
    waitForActions = testActions(component.stateManager);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should update the input text", async(async () => {
    await waitForActions([
      () => component.textUpdate$.next("a"),
      () => component.textUpdate$.next("abc"),
      () => component.textUpdate$.next("ab"),
    ]);
    expect(component.state.aText).toEqual("ab");
  }));

  it("should update the input text automatically 1/2", async(async () => {
    await waitForActions([
      () => component.textUpdate$.next("qwer"),
      () => component.textUpdate$.next("asdf"),
      () => component.textUpdate$.next("bingo"),
    ]);
    expect(component.state.aText).toEqual("[change me]");
  }));

  it("should update the input text automatically 2/2", async(async () => {
    await waitForActions([
      () => component.textUpdate$.next("qwer"),
      () => component.textUpdate$.next("asdf"),
      () => component.textUpdate$.next("bingo"),
      () => component.textUpdate$.next("fgh"),
    ]);
    expect(component.state.aText).toEqual("fgh");
  }));
});
