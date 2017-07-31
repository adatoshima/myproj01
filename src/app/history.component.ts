import { Component, OnInit } from '@angular/core';
import { Api }    from './api';

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
    time:he.time.toTimeString().split(' ')[0],
    dir:he.dir,
    style:op.style
  };
}

class HistoryRecord {
  exchange:string;
  syml:string;
  symr:string;
  oplimit:any;
  limit:any;
  hea:HistoryEntry[]=[];
  htea:HistoryTextEntry[]=[];
  priceDigits:number;
  volDigits:number;
  sub:any;
  fromJson:any;
  
  constructor(exchange:string='') {
    this.exchange=exchange;
  }

  setSym(l,r) {
    this.syml=l;
    this.symr=r;
  }

  subscribe(api,interval) {
    let info=api.getSymInfo(this.syml,this.symr);
    if (!info) return;
    this.priceDigits=info.digits;
    let op={
      cmd:'history',
      syml:this.syml,
      symr:this.symr,
      limit:this.oplimit,
      };
    this.sub=api.subscribe(op,{interval:interval},this.fromJson);
  }

}

function nhr(op):HistoryRecord {
  let hr=new HistoryRecord(op.ex);
  hr.fromJson=op.fj.bind(hr);
  hr.priceDigits=isInt(op.pd)?op.pd:2;
  hr.volDigits=isInt(op.vd)?op.vd:2;
  return hr;
}
/*
class DepthView {
  syml:string;
  symr:string;
  dia:DepthInfo[];
  //exchanges:any[];
  constructor(left:string,right:string) {
    this.syml=left;
    this.symr=right;
    this.dia=[];
  }
  get sym() : string {
    return (this.syml+this.symr).toLowerCase();
  }
  start() {
    for (let di of this.dia) {
      di.sub.start();
    }
  }
  stop() {
    for (let di of this.dia) {
      di.sub.stop();
    }
  }
}//*/

@Component({
  selector: 'history-comp',
  templateUrl: './history.component.html',
  styleUrls:[ './history.component.css',]
})
export class HistoryComponent implements OnInit { 
  buttonText:string;
  hisview:HistoryRecord[]=[];
  constructor(private api:Api){}
  //mex=['yunbi','bter'];
  limit:number;

  //opt1=0.015;
  //opt2=0.005;

  getApi(apistr) {
    return this.api.get(apistr);
  }

  toggle(): void {
    if (this.buttonText=='start') {
      this.buttonText='stop';
      this.hisview.forEach(hr => hr.sub.start());
    } else {
      this.buttonText='start';
      this.hisview.forEach(hr => hr.sub.stop());
    }
  }

  ngOnInit(): void {
    this.buttonText='stop';
    this.limit=100;

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
        time:e.time.toTimeString().split(' ')[0],
        dir:e.dir,
        style:'new'
      }));
      let ota=this.htea.slice(0,this.limit-l);
      ota.forEach(e => e.style='old');
      this.htea=nta.concat(ota);
      this.hea=na.concat(this.hea.slice(0,this.limit-l));
    }

    this.hisview.push(nhr({fj:fjyb,ex:'yunbi'}));
    this.hisview[0].setSym('eos','cny');

    for (let hr of this.hisview) {
        hr.limit=this.limit;
        let api=this.api.get(hr.exchange);
        let i;
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
        hr.subscribe(api,i);
      }
    }
  }
}
