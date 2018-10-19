import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SimplerIteratorTestComponent } from "./simpler-iterator-test.component";

describe("SimplerIteratorTestComponent", () => {
  let component: SimplerIteratorTestComponent;
  let fixture: ComponentFixture<SimplerIteratorTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SimplerIteratorTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplerIteratorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
