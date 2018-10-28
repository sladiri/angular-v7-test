import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";

@Component({
  selector: "app-list-child-item-test",
  templateUrl: "./list-child-item-test.component.html",
  styleUrls: ["./list-child-item-test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChildItemTestComponent {
  @Input()
  id;

  @Input()
  name;

  @Output()
  itemClicked = new EventEmitter();

  emitItemClicked(value) {
    this.itemClicked.emit(value);
  }
}
