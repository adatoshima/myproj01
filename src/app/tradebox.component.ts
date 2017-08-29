import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Api }    from './api';
import { api_keys } from './settings'

@Component({
  selector:'tradebox-comp',
  templateUrl:'./tradebox.component.html',
})
export class TradeboxComponent {
  
  constructor(private api:Api) {
  }
}