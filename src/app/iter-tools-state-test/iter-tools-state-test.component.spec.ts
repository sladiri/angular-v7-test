import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { take } from "rxjs/operators";

import { IterToolsStateTestComponent } from "./iter-tools-state-test.component";
import { IterToolsStateTestChildComponent } from "../iter-tools-state-test-child/iter-tools-state-test-child.component";

import { IEventsIterator, EventsIterator } from "@local/EventsIterator";
import { startTest } from "@local/IteratorStateManagement";

describe("IterToolsStateTestComponent", () => {
  let fixture: ComponentFixture<IterToolsStateTestComponent>;
  let component: IterToolsStateTestComponent;
  let eventsIterator: IEventsIterator;

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
    eventsIterator = await startTest(component);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should increment the counter", async(async () => {
    eventsIterator.dispatch(component.clicked(new EventTarget()));
    eventsIterator.dispatch({ type: "DELETE" });
    for await (const item of eventsIterator) {
    }
    expect(await component.counter$.pipe(take(1)).toPromise()).toEqual(1);
  }));
});
