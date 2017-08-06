import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';
import { Api, SubcribeOjbect }    from './api';
import * as UF from './utilFunctions';

function isInt(n) {
  return (n===parseInt(n,10));
}

class HistoryEntry {
  id:number;
  price:number;
  vol:number;
  amt:number;
  time:Date;
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

function formatHistory(he:HistoryEntry,op):HistoryTextEntry {
  return {
    price:he.price.toFixed(op.pd),
    vol:he.vol.toFixed(op.vd),
    amt:he.amt.toFixed(op.ad),
    time:UF.timestr(he.time),
    dir:he.dir,
    style:op.style
  };
}

class HistoryRecord {
  exchange:string;
  sym:string;
  syml:string;
  symr:string;
  oplimit:any;
  limit:any;
  hea:HistoryEntry[]=[];
  htea:HistoryTextEntry[]=[];
  priceDigits:number;
  volDigits:number;
  sub:SubcribeOjbect;
  subEx:any;
  fromJson:any;
  
  constructor(exchange:string='') {
    this.exchange=exchange;
  }

  setSym(l,r) {
    this.syml=l;
    this.symr=r;
  }

  subscribe(api,interval) {
    //let sym=this.sym?this.sym:{syml:this.syml,symr:this.symr};
    let info=api.getSymInfo(this);
    if (!info) return;
    this.hea.length=0;
    this.htea.length=0;
    this.priceDigits=info.digits;
    this.volDigits=info.vdigits;
    let op={
      cmd:'history',
      sym:this.sym,
      syml:this.syml,
      symr:this.symr,
      limit:this.oplimit,
    };
    this.sub=api.subscribe(op,{interval:interval},this.fromJson);
  }

  subscribeEx(api) {
    //let sym=this.sym?this.sym:{syml:this.syml,symr:this.symr};
    if (this.subEx) this.unsubscribeEx();
    let info=api.getSymInfo(this);
    if (!info) return;
    this.hea.length=0;
    this.htea.length=0;
    this.priceDigits=info.digits;
    this.volDigits=info.vdigits;
    let op={
      cmd:'history',
      sym:this.sym,
      syml:this.syml,
      symr:this.symr,
      limit:this.oplimit,
    };
    this.subEx={api:api,wi:api.subscribeEx(op,{},this.fromJson)};
  }

  unsubscribeEx() {
    let s=this.subEx;
    s.api.unsubscribeEx(s.wi);
    this.subEx=null;
  }

}

function nhr(op):HistoryRecord {
  let hr=new HistoryRecord(op.ex);
  hr.fromJson=op.fj.bind(hr);
  hr.priceDigits=isInt(op.pd)?op.pd:2;
  hr.volDigits=isInt(op.vd)?op.vd:2;
  return hr;
}

@Component({
  selector: 'history-comp',
  templateUrl: './history.component.html',
  styleUrls:[ './history.component.css',]
})
export class HistoryComponent implements OnInit,OnDestroy { 
  buttonText:string;
  hisrec:HistoryRecord;
  constructor(private api:Api){}
  limit:number;
  symList:any[];
  //curSym:string;
  dataService: CompleterData;
  dummy:any;

  _subcrribe() {
    let i,hr=this.hisrec;
    switch (hr.exchange) {
      case 'yunbi':
      i=500;
      break;
      case 'bter':
      i=2000;
      break;
      default:
      i=2000;
      break;
    }
    hr.subscribe(this.api.get(hr.exchange),i);
  }

  _subcrribeEx() {
    let hr=this.hisrec;
    hr.subscribeEx(this.api.get(hr.exchange));
  }

  onSymSelect(item: CompleterItem) {
    if (item) {
      let hr=this.hisrec;
      if (hr.sym!==item.title) {
        hr.sym=item.title;
        //if (hr.sub) hr.sub.stop();
        this._subcrribeEx();
      }
    }
  }

  getApi(apistr) {
    return this.api.get(apistr);
  }

  toggle(): void {
    if (this.buttonText=='start') {
      this.buttonText='stop';
      this._subcrribeEx();//.forEach(hr => hr.sub.start());
    } else {
      this.buttonText='start';
      this.hisrec.unsubscribeEx();//.forEach(hr => hr.sub.stop());
    }
  }

  ngOnInit(): void {
    this.buttonText='stop';
    this.limit=100;

    this.symList=this.api.get('yunbi').getSymList()
    .map(e => e.sym);

    function fjyb(j:HistoryEntryYunbi[]) {
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
        time:UF.timestr(e.time),
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    //this.hisview.push();
    this.hisrec=nhr({fj:fjyb,ex:'yunbi'});
    //hr.sym=this.curSym;
    //hr.setSym('qtum','cny');
    //this.hisview[0].setSym('eos','cny');

    this.hisrec.limit=this.limit;
    this.onSymSelect({
      title:'eoscny',
      originalObject:null,
      description:null,
      image:null
    });
    //this.dummy=this.hisrec.sym;
    //this._subcrribe();
  }

  ngOnDestroy(): void {
    this.hisrec.sub.stop();
  }
}

