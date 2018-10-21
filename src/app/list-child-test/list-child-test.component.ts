import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";

@Component({
  selector: "app-list-child-test",
  templateUrl: "./list-child-test.component.html",
  styleUrls: ["./list-child-test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChildTestComponent {
  items = [];

  @Input()
  set items$(value) {
    this.items = value;
    this.changeDetectRef.detectChanges();
  }

  constructor(private readonly changeDetectRef: ChangeDetectorRef) {}

  // Optimize change in list
  trackByItemId(index: number, item: object): number {
    return item["id"];
  }
}
