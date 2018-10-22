import { Directive, ElementRef } from "@angular/core";

@Directive({
  selector: "[appEnsureNoopener]",
})
export class EnsureNoopenerDirective {
  private readonly NO_OPENER = "noopener";

  constructor(readonly elRef: ElementRef) {
    if (elRef.nativeElement.tagName !== "A") {
      console.warn("Invalid Element");
      return;
    }

    const el = elRef.nativeElement;
    if (!this.needsNoopener(el["target"], el["rel"])) {
      return;
    }

    let rel = el.getAttribute("rel");
    if (typeof rel !== "string") {
      rel = "";
    }
    rel = rel
      .split(" ")
      .concat(this.NO_OPENER)
      .join(" ")
      .trim();
    el.setAttribute("rel", rel);
  }

  private needsNoopener(target, rel = "") {
    return target === "_blank" && !rel.includes(this.NO_OPENER);
  }
}
