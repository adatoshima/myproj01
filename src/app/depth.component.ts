import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Api }    from './api';

function depth_bter(s) {
  let el=(new DOMParser()).parseFromString(s,'text/html').body;
  let arr=([].slice.call(el.children)).map(e => ([
      +e.children[0].textContent,
      +e.children[1].textContent,
      +e.children[2].textContent
    ]));
  return arr;
}

@Component({
  selector: 'depth-comp',
  templateUrl: './depth.component.html',
  styleUrls:[ './depth.component.css',]
})
export class DepthComponent implements OnInit,OnDestroy,OnChanges { 

  @Input() cs;
  asks:any[]=[];
  bids:any[]=[];
  limit:any;
  priceDigits:number;
  volDigits:number;
  translator:any;
  subEx:any;
  trans:Map<any,any>;

  getApi(apistr) {
    return this.api.get(apistr);
  }

  subscribe() {
    //let sym=this.sym?this.sym:{syml:this.syml,symr:this.symr};
    if (this.subEx) this.unsubscribe();
    let api=this.getApi(this.cs.exg)
    let info=api.getSymInfo(this.cs.sym);
    if (!info) return;
    let trans=this.trans.get(this.cs.exg);
    if (!trans) return;
    this.translator=trans.bind(this);
    this.asks.length=0;
    this.bids.length=0;
    this.priceDigits=info.digits;
    this.volDigits=info.vdigits;
    let op={
      cmd:'depth',
      sym:this.cs.sym,
      limit:this.limit,
    };
    this.subEx={api:api,wi:api.subscribeEx(op,{},this.translator)};
  }

  unsubscribe() {
    let s=this.subEx;
    if (!s) return;
    s.api.unsubscribeEx(s.wi);
    this.subEx=null;
  }

  ngOnChanges(changes: any) {
    if (!changes.cs.currentValue) return;
    this.cs=changes.cs.currentValue;
    this.subscribe();
  }

  constructor(private api:Api) {
    this.limit=10;

    function tryb(j) {
      this.asks=j.asks.slice(-this.limit).map(e => [+e[0],+e[1]]);
      this.bids=j.bids.slice(0,this.limit).map(e => [+e[0],+e[1]]);
      this.oasks=this.asks.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(2)
        ]);
      this.obids=this.bids.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(2)
        ]);
    }
    function trjubi(j) {
      this.asks=j.asks.slice(-this.limit);//.map(e => [+e[0],+e[1]]);
      this.bids=j.bids.slice(0,this.limit);//.map(e => [+e[0],+e[1]]);
      this.oasks=this.asks.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(2)
        ]);
      this.obids=this.bids.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(2)
        ]);
    }
    function trlq(j) {
      let jx=j[this.cs.sym];
      if (!jx) {
        console.log('liqui depth api error:',j);
        return;
      }
      j=jx;
      this.asks=j.asks.slice(0,this.limit).reverse();//.map(e => [+e[0],+e[1]]);
      this.bids=j.bids.slice(0,this.limit);//.map(e => [+e[0],+e[1]]);
      this.oasks=this.asks.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(8)
        ]);
      this.obids=this.bids.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        (e[0]*e[1]).toFixed(8)
        ]);
    }
    function trbter(j) {
      //this.asks=j.asks.slice(0,this.limit).reverse().map(e => [+e[0],+e[1],e[2]]);
      //this.bids=j.bids.slice(0,this.limit).map(e => [+e[0],+e[1],e[2]]);
      this.asks=depth_bter(j.ask_list_table).reverse().slice(-this.limit);
      this.bids=depth_bter(j.bid_list_table).slice(0,this.limit);
      this.oasks=this.asks.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        e[2].toFixed(2)
        ]);
      this.obids=this.bids.map(e => [
        e[0].toFixed(this.priceDigits),
        e[1].toFixed(this.volDigits),
        e[2].toFixed(2)
        ]);
    }

    this.trans=new Map([
      ['yunbi',tryb],
      ['bter',trbter],
      ['jubi',trjubi],
      ['liqui',trlq],//same as jubi
      ]);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
