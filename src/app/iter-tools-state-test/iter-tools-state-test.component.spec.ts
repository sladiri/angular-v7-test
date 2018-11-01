import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { testActions } from "@local/IteratorStateManagement";

import { IterToolsStateTestComponent } from "./iter-tools-state-test.component";
import { IterToolsStateTestChildComponent } from "../iter-tools-state-test-child/iter-tools-state-test-child.component";

describe("IterToolsStateTestComponent", () => {
  let fixture: ComponentFixture<IterToolsStateTestComponent>;
  let component: IterToolsStateTestComponent;
  let waitForActions: (actions: Array<Function>) => Promise<void>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IterToolsStateTestComponent,
        IterToolsStateTestChildComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(IterToolsStateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.stateManager.eventsIterator.clearQueue(); // Clear actions queued in onInit
    waitForActions = testActions(component.stateManager);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should increment the counter", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(2);
    // expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(2);
  }));

  it("should increment the counter with NAP 1/5", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(4);
  }));

  it("should increment the counter with NAP 2/5", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(5);
  }));

  it("should increment the counter with NAP 3/5", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(7);
  }));

  it("should increment the counter with NAP 4/5", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(8);
  }));

  it("should increment the counter with NAP 5/5", async(async () => {
    await waitForActions([
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
      () => component.click$.next(),
    ]);
    expect(component.state.counter).toEqual(10);
  }));
});
