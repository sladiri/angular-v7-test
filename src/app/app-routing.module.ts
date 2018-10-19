import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { IteratorStateTestComponent } from "./iterator-state-test/iterator-state-test.component";
import { BabelTestComponent } from "./babel-test/babel-test.component";
import { ViewContainerComponent } from "./view-container/view-container.component";
import { SimplerIteratorTestComponent } from "./simpler-iterator-test/simpler-iterator-test.component";

const routes: Routes = [
  { path: "babel-test", component: BabelTestComponent },
  { path: "iterator-state-test", component: IteratorStateTestComponent },
  { path: "view-container", component: ViewContainerComponent },
  { path: "simpler-iterator-test", component: SimplerIteratorTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
