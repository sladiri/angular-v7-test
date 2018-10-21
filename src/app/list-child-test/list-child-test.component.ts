import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "app-list-child-test",
  templateUrl: "./list-child-test.component.html",
  styleUrls: ["./list-child-test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChildTestComponent {
  @Input()
  items$: Observable<any>;

  // Optimize change in list
  trackByItemId(index: number, item: object): number {
    return item["id"];
  }
}
