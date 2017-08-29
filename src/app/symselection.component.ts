import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Api, exchange }    from './api';
//import * as UF from './utilFunctions';

@Component({
  selector:'symsel-comp',
  templateUrl:'./symselection.component.html',
  styleUrls:['./symselection.component.css'],
})
export class SymSelectionComponent implements OnInit {
  all:any[]=[];
  exg:string;
  sym:string;
  hidden:boolean;
  @Output() sel=new EventEmitter<any>();

  moclick(e:MouseEvent) {
    if (e.currentTarget===e.target) this.hide();
  }

  onSelect(e,s) {
    if (this.exg===e && this.sym===s) return;
    this.exg=e;
    this.sym=s;
    this.sel.emit({exg:e,sym:s});
    //console.log(e,s);
  }

  show() {
    this.hidden=false;
  }

  hide() {
    this.hidden=true;
  }

  ngOnInit() {
    this.sel.emit({exg:this.exg,sym:this.sym});
  }

  updateSymList(exg) {
    let a=this.api.get(exg);
    if (!a) return;
    let si=this.all.find(e => e.exg===exg);
    if (!si) {
      si={exg:exg,symlist:[]};
      this.all.push(si);
    }
    if (!a.inited) return;
    si.symlist=a.getSymList().map(e => e.sym);
  }

  constructor(private api:Api) {
    this.hidden=false;
    let ta=this.all;
    for (let e of exchange) {
      this.updateSymList(e);
      /*
      let a=api.get(e);
      if (!a) continue;
      let sl=a.getSymList();
      if (sl.length) {
        ta.push({exg:e,symlist:sl.map(e => e.sym)});
      }//*/
    }
    if (ta.length) {
      this.exg=ta[0].exg;
      this.sym=ta[0].symlist[0];
    }

  }
}