import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { Component }     from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Api }    from './api';

import { DepthComponent }  from './depth.component';
import { MainComponent }  from './main.component';
import { HistoryComponent }  from './history.component';
import { TestComponent }  from './test.component';
import { SymSelectionComponent } from './symselection.component';
import { TradeboxComponent } from './tradebox.component'
import { AnnScanComponent } from './annscan';

const appRoutes: Routes = [
  { path: 'test',      component: TestComponent },
  //{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports:      [ 
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      //{enableTracing:true}
    )
  ],
  declarations: [
    HistoryComponent,
    DepthComponent,
    MainComponent,
    TestComponent,
    SymSelectionComponent,
    TradeboxComponent,
    AnnScanComponent,
  ],
  bootstrap:    [ MainComponent ],
  providers: [
    Api
  ],
})
export class AppModule { }
