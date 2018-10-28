import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  selector: "app-list-child-test",
  templateUrl: "./list-child-test.component.html",
  styleUrls: ["./list-child-test.component.scss"],
  // TODO: should work with:
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChildTestComponent {
  @Input()
  items = [];

  @Output()
  itemClicked = new EventEmitter();

  updates = 0;

  constructor() {}

  _itemClicked(value) {
    value = [...value, `${Math.random()}`];
    this.itemClicked.emit(value);
  }

  // itemsUpdated(items?: Array<object>) {
  //   this.updateState({ items: items || this.items });
  // }

  // See parent, Angular can optimise if whole list is updated
  // itemUpdated(updatedItem: object) {
  //   this.updateState({ updatedItem });
  // }

  // Optimize change in list
  trackByItemId(index: number, item: object): number {
    return item["id"];
  }

  // private updateState(item) {
  //   const { items } = item;
  //   if (items) {
  //     this.items = items;
  //     this.updates += 1;
  //   }

  // const { updatedItem } = item;
  // if (updatedItem) {
  //   this.items[updatedItem["index"]]["name"] = updatedItem["name"];
  //   this.updates += 1;
  // }

  // this.changeDetectRef.detectChanges();
  // }
}
