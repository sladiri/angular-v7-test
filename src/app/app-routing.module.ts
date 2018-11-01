import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { IteratorStateTestComponent } from "./iterator-state-test/iterator-state-test.component";
import { BabelTestComponent } from "./babel-test/babel-test.component";
import { IterToolsStateTestComponent } from "./iter-tools-state-test/iter-tools-state-test.component";
import { AlarmComponent } from "./alarm/alarm.component";

const routes: Routes = [
  { path: "babel-test", component: BabelTestComponent },
  { path: "iterator-state-test", component: IteratorStateTestComponent },
  { path: "iter-tools-state-test", component: IterToolsStateTestComponent },
  { path: "alarm", component: AlarmComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
