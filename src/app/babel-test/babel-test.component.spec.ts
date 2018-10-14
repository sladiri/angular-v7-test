import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { BabelTestComponent } from "./babel-test.component";

describe("BabelTestComponent", () => {
  let component: BabelTestComponent;
  let fixture: ComponentFixture<BabelTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BabelTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BabelTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
