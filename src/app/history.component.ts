import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Api }    from './api';
import { isInt, timestr } from './utilFunctions';


class HistoryEntry {
  id:number;
  price:number;
  vol:number;
  amt:number;
  time:any;
  dir:string;
}

class HistoryTextEntry {
  price;
  vol;
  amt;
  time;
  dir;
  style;
}

class HistoryEntryYunbi {
  id:number;
  price:string;
  volume:string;
  funds:string;
  market:string;
  created_at:string;
  at:number;
  side:string;

  toHisEntry():any {
    let he:HistoryEntry= {
      id:this.id,
      price:+this.price,
      vol:+this.volume,
      amt:+this.funds,
      time:new Date(this.at*1000),
      dir:this.side
    }
    return he;
  }//*/
}

function toHisEntry_fyb(hey:HistoryEntryYunbi):any {
  let he:HistoryEntry= {
    id:hey.id,
    price:+hey.price,
    vol:+hey.volume,
    amt:+hey.funds,
    time:new Date(hey.at*1000),
    dir:hey.side
  }
  return he;
}//*/

function toHisEntry_fbter(result:any[],hbt:HTMLElement):any {
  if (!hbt.getAttribute('tid')) return result;
  result.push({
    id:+hbt.getAttribute('tid'),
    price:+hbt.children[1].textContent,
    vol:+hbt.children[2].textContent,
    amt:+hbt.children[3].textContent,
    time:hbt.children[0].textContent,
    dir:hbt.classList.contains('up')?'up':'down'
  });
  return result;
}//*/

function toHisEntry_fjubi(hejb:any):any {
  let he:HistoryEntry= {
    id:hejb.tid,
    price:hejb.price,
    vol:hejb.amount,
    amt:hejb.price*hejb.amount,
    time:new Date(hejb.date*1000),
    dir:hejb.type,
  }
  return he;
}//*/

function toHisEntry_flq(helq:any):any {
  let he:HistoryEntry= {
    id:helq.tid,
    price:helq.price,
    vol:helq.amount,
    amt:helq.price*helq.amount,
    time:new Date(helq.timestamp*1000),
    dir:helq.type,
  }
  return he;
}//*/

class HisTranslator {

  constructor(argument) {
    // code...
  }
}

@Component({
  selector: 'history-comp',
  templateUrl: './history.component.html',
  styleUrls:[ './history.component.css',]
})
export class HistoryComponent implements OnInit,OnDestroy,OnChanges { 
  oplimit:any;
  hea:HistoryEntry[]=[];
  htea:HistoryTextEntry[]=[];
  priceDigits:number;
  volDigits:number;
  subEx:any;
  translator:any;
  limit:number;
  trans:Map<any,any>;
  @Input() cs;

  subscribe() {
    //let sym=this.sym?this.sym:{syml:this.syml,symr:this.symr};
    if (this.subEx) this.unsubscribe();
    let api=this.getApi(this.cs.exg)
    let info=api.getSymInfo(this.cs.sym);
    if (!info) return;
    let trans=this.trans.get(this.cs.exg);
    if (!trans) return;
    this.translator=trans.bind(this);
    this.hea.length=0;
    this.htea.length=0;
    this.priceDigits=info.digits;
    this.volDigits=info.vdigits;
    let op={
      cmd:'history',
      sym:this.cs.sym,
      limit:this.oplimit,
    };
    this.subEx={api:api,wi:api.subscribeEx(op,{},this.translator)};
  }

  unsubscribe() {
    let s=this.subEx;
    if (!s) return;
    s.api.unsubscribeEx(s.wi);
    this.subEx=null;
  }

  constructor(private api:Api) {
    this.limit=200;

    function tryb(j:HistoryEntryYunbi[]) {
      let startid=this.hea[0]?this.hea[0].id:0,l=j.length;
      if (startid) {
        l=Math.min(j.findIndex(e => e.id===startid),l);
      }
      if (l>this.limit) l=this.limit;
      if (l===0) return;
      let na=j.slice(0,l).map(toHisEntry_fyb);
      let nta=na.map(e => ({
        price:e.price.toFixed(this.priceDigits),
        vol:e.vol.toFixed(this.volDigits),
        amt:e.amt.toFixed(2),
        time:timestr(e.time),
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    function trlq(j:any[]) {
      j=j[this.cs.sym];
      let startid=this.hea[0]?this.hea[0].id:0,l=j.length;
      if (startid) {
        l=Math.min(j.findIndex(e => e.tid===startid),l);
      }
      if (l>this.limit) l=this.limit;
      if (l===0) return;
      let na=j.slice(0,l).map(toHisEntry_flq);
      let nta=na.map(e => ({
        price:e.price.toFixed(this.priceDigits),
        vol:e.vol.toFixed(this.volDigits),
        amt:e.amt.toFixed(8),
        time:timestr(e.time),
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    function trjubi(j:any[]) {
      j=j.reverse();
      let startid=this.hea[0]?this.hea[0].id:0,l=j.length;
      if (startid) {
        l=Math.min(j.findIndex(e => e.tid===startid),l);
      }
      if (l>this.limit) l=this.limit;
      if (l===0) return;
      let na=j.slice(0,l).map(toHisEntry_fjubi);
      let nta=na.map(e => ({
        price:e.price.toFixed(this.priceDigits),
        vol:e.vol.toFixed(this.volDigits),
        amt:e.amt.toFixed(2),
        time:timestr(e.time),
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    function trbter(j) {
      let el=(new DOMParser()).parseFromString(j.trade_list_table,'text/html').body;
      let arr=(Array.from(el.children)).reduce(toHisEntry_fbter,[]);
      let startid=this.hea[0]?this.hea[0].id:0,l=arr.length;
      if (startid) {
        l=Math.min(arr.findIndex(e => e.id===startid),l);
      }
      if (l>this.limit) l=this.limit;
      if (l===0) return;
      let na=arr.slice(0,l);
      let nta=na.map(e => ({
        price:e.price.toFixed(this.priceDigits),
        vol:e.vol.toFixed(this.volDigits),
        amt:e.amt.toFixed(2),
        time:e.time,
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    this.trans=new Map([
      ['yunbi',tryb],
      ['bter',trbter],
      ['jubi',trjubi],
      ['liqui',trlq],
      ]);

  }

  getApi(apistr) {
    return this.api.get(apistr);
  }

  ngOnChanges(changes: any) {
    if (!changes.cs.currentValue) return;
    this.cs=changes.cs.currentValue;
    this.subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}

/*
function formatHistory(he:HistoryEntry,op):HistoryTextEntry {
  return {
    price:he.price.toFixed(op.pd),
    vol:he.vol.toFixed(op.vd),
    amt:he.amt.toFixed(op.ad),
    time:timestr(he.time),
    dir:he.dir,
    style:op.style
  };
}//*/

