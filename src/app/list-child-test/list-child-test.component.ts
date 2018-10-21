import { Component, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-list-child-test",
  templateUrl: "./list-child-test.component.html",
  styleUrls: ["./list-child-test.component.scss"],
})
export class ListChildTestComponent {
  items = [];
  updates = 0;

  constructor(private changeDetectRef: ChangeDetectorRef) {
    this.changeDetectRef.detach();
  }

  itemsUpdated(items?: Array<object>) {
    this.updateState({ items: items || this.items });
  }

  itemUpdated(updatedItem: object) {
    this.updateState({ updatedItem });
  }

  // Optimize change in list
  trackByItemId(index: number, item: object): number {
    return item["id"];
  }

  private updateState(item) {
    const { items } = item;
    if (items) {
      this.items = items;
    }

    const { updatedItem } = item;
    if (updatedItem) {
      this.items[updatedItem["index"]]["name"] = updatedItem["name"];
      this.updates += 1;
    }

    this.changeDetectRef.detectChanges();
  }
}
