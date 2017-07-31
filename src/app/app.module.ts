import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component }     from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//import { Ticker }    from './ticker';
//import { TickerComponent }  from './ticker.component';
import { Api }    from './api';

import { DepthComponent }  from './depth.component';
import { MainComponent }  from './main.component';
import { HistoryComponent }  from './history.component';

const appRoutes: Routes = [
  { path: 'history', component: HistoryComponent },
  { path: 'depth',      component: DepthComponent },
  //{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports:      [ 
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      //{enableTracing:true}
    )
  ],
//  declarations: [ TickerComponent ],
//  bootstrap:    [ TickerComponent ],
  declarations: [
    HistoryComponent,
    DepthComponent,
    MainComponent,
  ],
  bootstrap:    [ MainComponent ],
  providers: [
    //YunbiTicker,
    //Ticker,
    //DepthApi
    Api
  ],
})
export class AppModule { }
