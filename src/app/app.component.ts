import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "angular-v7-tests";
}

// Syntax tests (Babel)

async function* foo(limit = 5) {
  let i = 0;
  do {
    yield i;
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });
    i += 1;
  } while (i < limit);
}

(async function testDynamicImport() {
  const { fn } = await import("./dynamic-import-test");
  console.log("testDynamicImport", fn());
  for await (const item of foo()) {
    console.log("async iterator item", item);
  }
})().catch(err => console.error(err));

const o = { a: 42 };
const p = { ...o, b: 666 };
console.log("test object destructuring", JSON.stringify(p));

console.log("window BroadcastChannel", typeof BroadcastChannel);
