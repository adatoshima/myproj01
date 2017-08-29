import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
//import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';
import { Api, exchange }    from './api';
//import * as UF from './utilFunctions';
//import { HistoryXComponent } from './history-x.component'
import { SymSelectionComponent } from './symselection.component';
import { TradeboxComponent } from './tradebox.component';

declare var Notification:any;

@Component({
  selector: 'test-comp',
  /*
  template:`
  <div *ngFor="let e of [0,1,2]">
  <depth-comp></depth-comp>
  </div>`,//*/
  templateUrl: './test.component.html',
  styleUrls:[ './test.component.css',]
})
export class TestComponent implements OnInit {

  sym;
  exg;
  cs;
  type;
  @ViewChild('symsel') symsel:SymSelectionComponent;
  @ViewChild('tbx') tbx:TradeboxComponent;

  @Output() toggleAnnEmitter=new EventEmitter<any>();

  toggleAnn() {
    this.toggleAnnEmitter.emit(true);
  }

  onClick() {
    let nfo:any={};
    nfo.body='body';
    nfo.tag='tag';
    nfo.icon='../favicon.ico';
    //nfo.image='../favicon.ico';
    nfo.data='data';
    nfo.vibrate=null;
    //nfo.requireInteraction=true;
    nfo.sticky=true;
    nfo.sound='./sound.wav';
    //nfo.dir='dir';

    let nf=new Notification('title',nfo);
  }

  onSymselClick() {
    this.symsel.show();
  }

  ngSymSelection(ss) {
    this.exg=ss.exg;
    this.sym=ss.sym;
    this.cs=ss;
    this.symsel.hide();
    //console.log(ss.exg,ss.sym);
  }

  /*
  onSymSelect(item: CompleterItem) {
    if (item) {
        this.sym=item.title;
    } else {
      console.error('empty selected item');
    }
  }//*/

  ngOnInit() {
    this.type='depth';
    //this.symsel.onSelect('bter','cvc_cny')
    // this.exg='yunbi';
    // this.symList=this.api.get(this.exg).getSymList()
    //   .map(e => e.sym);
  }

  constructor(private api:Api) {
  }

}