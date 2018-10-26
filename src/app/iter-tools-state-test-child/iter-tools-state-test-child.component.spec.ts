import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IterToolsStateTestChildComponent } from "./iter-tools-state-test-child.component";

describe("IterToolsStateTestChildComponent", () => {
  let component: IterToolsStateTestChildComponent;
  let fixture: ComponentFixture<IterToolsStateTestChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IterToolsStateTestChildComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IterToolsStateTestChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
