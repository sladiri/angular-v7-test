import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-babel-test",
  templateUrl: "./babel-test.component.html",
  styleUrls: ["./babel-test.component.scss"],
})
export class BabelTestComponent implements OnInit {
  aText = "... working";

  async ngOnInit() {
    // try {
    //   const { fn } = await import("./dynamic-import-test");
    //   console.log("testDynamicImport", fn());
    //   for await (const item of this.foo()) {
    //     console.log("async iterator item:", item);
    //   }
    //   const o = { a: 42 };
    //   const p = { ...o, b: 666 };
    //   console.log("test object destructuring:", JSON.stringify(p));
    //   console.log("typeof BroadcastChannel:", typeof BroadcastChannel);
    //   this.aText = "babel-test works!";
    // } catch (error) {
    //   console.error(error);
    //   this.aText = "babel-test error!";
    // }
  }

  private async *foo(limit = 5) {
    let i = 0;
    do {
      yield i;
      await new Promise(resolve => {
        setTimeout(resolve, 500);
      });
      i += 1;
    } while (i < limit);
  }
}
