import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ListChildItemTestComponent } from "./list-child-item-test.component";

describe("ListChildItemTestComponent", () => {
  let component: ListChildItemTestComponent;
  let fixture: ComponentFixture<ListChildItemTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListChildItemTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListChildItemTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
