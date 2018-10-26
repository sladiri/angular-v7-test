import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: "app-iter-tools-state-test-child",
  templateUrl: "./iter-tools-state-test-child.component.html",
  styleUrls: ["./iter-tools-state-test-child.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IterToolsStateTestChildComponent {
  constructor() {}

  @Input()
  counter: number;
}
