import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { IteratorStateTestComponent } from "./iterator-state-test/iterator-state-test.component";
import { BabelTestComponent } from "./babel-test/babel-test.component";
import { ViewContainerComponent } from "./view-container/view-container.component";
import { ListChildTestComponent } from "./list-child-test/list-child-test.component";
import { ListChildItemTestComponent } from "./list-child-item-test/list-child-item-test.component";
import { EnsureNoopenerDirective } from "./ensure-noopener.directive";

@NgModule({
  declarations: [
    AppComponent,
    IteratorStateTestComponent,
    BabelTestComponent,
    ViewContainerComponent,
    ListChildTestComponent,
    ListChildItemTestComponent,
    EnsureNoopenerDirective,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
