import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ListChildTestComponent } from "./list-child-test.component";
import { ListChildItemTestComponent } from "../list-child-item-test/list-child-item-test.component";

describe("ListChildTestComponent", () => {
  let component: ListChildTestComponent;
  let fixture: ComponentFixture<ListChildTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListChildTestComponent, ListChildItemTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListChildTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
