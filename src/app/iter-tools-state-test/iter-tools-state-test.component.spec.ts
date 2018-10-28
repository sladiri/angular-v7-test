import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { take } from "rxjs/operators";

import { IterToolsStateTestComponent } from "./iter-tools-state-test.component";
import { IterToolsStateTestChildComponent } from "../iter-tools-state-test-child/iter-tools-state-test-child.component";

import { IEventsIterator, IMessage } from "@local/EventsIterator";
import { createTestIterator } from "@local/IteratorStateManagement";

describe("IterToolsStateTestComponent", () => {
  let fixture: ComponentFixture<IterToolsStateTestComponent>;
  let component: IterToolsStateTestComponent;
  let eventsIterator: IEventsIterator<IMessage>;
  let testIterator: (actionsCount: number) => Promise<void>;

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
    eventsIterator = await (component.sm.eventsIterator.start() as Promise<
      IEventsIterator<IMessage>
    >);
    testIterator = createTestIterator(eventsIterator);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should increment the counter", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(2);
  }));

  it("should increment the counter with NAP 1/5", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(4);
  }));

  it("should increment the counter with NAP 2/5", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(5);
  }));

  it("should increment the counter with NAP 3/5", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(6);
  }));

  it("should increment the counter with NAP 4/5", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(8);
  }));

  it("should increment the counter with NAP 5/5", async(async () => {
    await testIterator(
      [
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
        component.click$.next(new EventTarget()),
      ].length,
    );
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(12);
  }));
});
