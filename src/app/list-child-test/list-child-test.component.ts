import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { scan } from "rxjs/operators";

@Component({
  selector: "app-list-child-test",
  templateUrl: "./list-child-test.component.html",
  styleUrls: ["./list-child-test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChildTestComponent {
  @Input()
  items = [];

  @Output()
  itemClicked = new EventEmitter();

  readonly updates$ = new BehaviorSubject<number>(0);
  readonly _updates$ = this.updates$.pipe(scan(acc => acc + 1));

  emitItemClicked(value) {
    value = [...value, `${Math.random()}`];
    this.itemClicked.emit(value);
  }

  // Optimize change in list
  trackByItemId(index: number, item: object): number {
    return item["id"];
  }
}
