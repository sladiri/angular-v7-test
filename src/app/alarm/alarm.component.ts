import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { Subject, fromEvent, merge } from "rxjs";
import { map, tap } from "rxjs/operators";
import {
  IIteratorStateManagement,
  IteratorStateManagement,
} from "@local/IteratorStateManagement";

// #region Actions
const tagCleared = () => {
  return { tagContact: null } as object;
};

const keypadButtonPressed = (name: string) => {
  return { keypadButton: name } as object;
};

const locked = (status: boolean) => {
  return { lock: status };
};
// #endregion

@Component({
  selector: "app-alarm",
  templateUrl: "./alarm.component.html",
  styleUrls: ["./alarm.component.scss"],
})
export class AlarmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("tag")
  tag: ElementRef;

  @ViewChildren("dropZone")
  dropZones!: QueryList<ElementRef>;

  @ViewChild("disarm")
  disarm: ElementRef;

  @ViewChild("arm")
  arm: ElementRef;

  // #region Input
  readonly testInput$: Subject<object> = new Subject<object>(); // Testing API
  readonly tagCleared$: Subject<void> = new Subject<void>();
  private readonly locked$: Subject<boolean> = new Subject<boolean>();
  private readonly inputs = [
    this.tagCleared$.pipe(map(tagCleared)),
    this.locked$.pipe(map(locked)),
    this.testInput$.asObservable(),
  ];
  // #endregion

  readonly state: any = Object.assign(Object.create(null), {
    locked: true,
    armed: true,
    notifying: false,
    tagContact: { access: false, keypad: false },
  });
  stateManager: IIteratorStateManagement<any, object>;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    const droppedTag$ = merge(
      fromEvent(this.tag.nativeElement, "dragstart"),
      merge(
        fromEvent(this.tag.nativeElement, "drop"),
        ...this.dropZones.map(ref => fromEvent(ref.nativeElement, "dragover")),
        ...this.dropZones.map(ref => fromEvent(ref.nativeElement, "drop")),
      ).pipe(tap((event: Event) => event.preventDefault())),
    );

    const keypadButtons$ = merge(
      merge(
        fromEvent(this.disarm.nativeElement, "mousedown"),
        fromEvent(this.disarm.nativeElement, "mouseup"),
      ).pipe(map(() => "disarm")),
      merge(
        fromEvent(this.arm.nativeElement, "mousedown"),
        fromEvent(this.arm.nativeElement, "mouseup"),
      ).pipe(map(() => "arm")),
    ).pipe(map(keypadButtonPressed));

    this.stateManager = new IteratorStateManagement(
      this.state,
      [...this.inputs, droppedTag$, keypadButtons$],
      [this.generateDrops, this.generateHolds, this.updateState.bind(this)],
      this.nextActionPredicate.bind(this),
    );
  }

  ngOnDestroy() {
    this.stateManager.unsubscribe();
  }

  private async *generateDrops(source: AsyncIterable<any>) {
    for await (const item of source) {
      if (!(item instanceof Event)) {
        yield item;
        continue;
      }

      if (item.type === "dragstart") {
        yield { tagContact: null };
      }

      if (item.type === "dragstart") {
        for await (const dragging of source) {
          if (dragging.type === "drop") {
            yield { tagContact: dragging.target["className"] };
            break;
          }

          if (dragging.type === "dragstart") {
            yield { tagContact: null };
          }
        }
      }
    }
  }

  private async *generateHolds(source: AsyncIterable<any>) {
    let held = null;
    let last = null;
    for await (const item of source) {
      if (!item.keypadButton) {
        yield item;
        continue;
      }
      if (!last) {
        last = Date.now();
        continue;
      }
      held = item.keypadButton;
      const diff = Date.now() - last;
      if (diff > 500) {
        yield { keypadButton: held };
      }
      last = null;
    }
  }

  private async *updateState(source: AsyncIterable<any>) {
    const state = this.state;
    for await (const item of source) {
      const { tagContact } = item;
      if (tagContact !== undefined) {
        Object.keys(state.tagContact).forEach(
          key => (state.tagContact[key] = false),
        );
      }
      if (tagContact) {
        state.tagContact[tagContact] = true;
      }

      const { keypadButton } = item;
      if (state.tagContact.keypad) {
        if (keypadButton === "disarm") {
          state.armed = false;
        }
        if (keypadButton === "arm") {
          state.armed = true;
        }
      }

      const { lock } = item;
      if (typeof lock === "boolean") {
        state.locked = lock;
      }

      yield item;
    }
  }

  private nextActionPredicate() {
    const state = this.state;

    if (state.locked && !state.armed && state.tagContact.access) {
      this.locked$.next(false); // Only the first action is testable (without a setTimeout)
      this.tagCleared$.next();
      return true;
    }

    if (!state.locked && state.armed) {
      this.locked$.next(true);
      this.tagCleared$.next();
      return true;
    }
  }
}
