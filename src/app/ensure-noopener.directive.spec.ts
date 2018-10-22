import { EnsureNoopenerDirective } from "./ensure-noopener.directive";
import { ElementRef } from "@angular/core";

class MockElementRef extends ElementRef {}

describe("EnsureNoopenerDirective", () => {
  it("should create an instance", () => {
    const ref = new MockElementRef({ tagName: "A" });
    const directive = new EnsureNoopenerDirective(ref);
    expect(directive).toBeTruthy();
  });
});
