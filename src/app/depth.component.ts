import { Component, OnInit } from '@angular/core';
import { Api }    from './api';

class DepthInfo {
  exchange:string;
  syml:string;
  symr:string;
  asks:any[];
  bids:any[];
  limit:any;
  priceDigits:number;
  volDigits:number;
  sub:any;
  fromJson:any;
  
  constructor(exchange:string) {
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
      cmd:'depth',
      syml:this.syml,
      symr:this.symr,
      limit:this.limit
      };
    this.sub=api.subscribe(op,{interval:interval,nostart:true},this.fromJson);
  }
}

function ndi(fj,exchange,pd=2,vd=2):DepthInfo {
  let di=new DepthInfo(exchange);
  di.fromJson=fj.bind(di);
  di.priceDigits=pd;
  di.volDigits=vd;
  return di;
}

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

let acc_yunbi=[900,130];
let acc_bter=[3000,300];

@Component({
  selector: 'depth-comp',
  templateUrl: './depth.component.html',
  styleUrls:[ './depth.component.css',]
})
export class DepthComponent implements OnInit { 
  buttonText:string;
  depthview:DepthView[]=[];
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
      this.depthview.forEach(dv => dv.start());
    } else {
      this.buttonText='start';
      this.depthview.forEach(dv => dv.stop());
    }
  }

  /*
  update(api,data) {
    //let das=this.depth.apis;
    let dv=this.depthview.find(e => e.syml===api.syml&&e.symr===api.symr);
    if (!dv) return;
    let di=dv.dia.find(e => api.exchange===e.exchange);

    switch (api.exchange) {
      case "yunbi":
        di.asks=data.asks.slice(-this.limit).map(e => [+e[0],+e[1]]);
        di.bids=data.bids.slice(0,this.limit).map(e => [+e[0],+e[1]]);
        break;
       case "chbtc":
       case "bter":
       case "jubi":
        di.asks=data.asks.slice(-this.limit);
        di.bids=data.bids.slice(0,this.limit);
        break;
      default:
        break;
    }
    let pd=di.priceDigits,vd=di.volDigits;
    di.oasks=di.asks.map(e => [e[0].toFixed(pd),e[1].toFixed(vd)]);
    di.obids=di.bids.map(e => [e[0].toFixed(pd),e[1].toFixed(vd)]);
    let ex0=dv.dia.find(e => e.exchange===this.mex[0]);
    let ex1=dv.dia.find(e => e.exchange===this.mex[1]);
    //this.mockTrade(ex0,ex1);
  }//*/

  /*
  mockTrade(ex0,ex1) {
    let level=10000;
    let acc0=acc_yunbi,acc1=acc_bter;
    let lvla0=0,lvla1=0,lvlb0=0,lvlb1=0,i,sum=0;
    for (i=this.limit-1;i>=0;--i) {
      sum+=ex0.asks[i][0]*ex0.asks[i][1];
      if sum>=level {
        lvla0=ex0.asks[i][0];
        break;
      }
    }
    sum=0;
    for (i=this.limit-1;i>=0;--i) {
      sum+=ex1.asks[i][0]*ex1.asks[i][1];
      if sum>=level {
        lvla1=ex1.asks[i][0];
        break;
      }
    }
    sum=0;
    for (i=0;i<this.limit-1;++i) {
      sum+=ex0.bids[i][0]*ex0.bids[i][1];
      if sum>=level {
        lvlb0=ex0.bids[i][0];
        break;
      }
    }
    sum=0;
    for (i=0;i<this.limit-1;++i) {
      sum+=ex1.bids[i][0]*ex1.bids[i][1];
      if sum>=level {
        lvlb1=ex1.bids[i][0];
        break;
      }
    }
    if (lvla0&&lvlb1&&(lvlb1-lvla0)/lvla0>this.opt1) {
      //buy 0 sell 1
      console.log(`buy ${this.mex[0]} sell ${this.mex[1]}`);
    }
    if (lvla1&&lvlb0&&(lvlb0-lvla1)/lvlb0>this.opt2) {
      //sell0 buy 1 
      console.log(`sell ${this.mex[0]} buy ${this.mex[1]}`);
    }
  }//*/

  ngOnInit(): void {
    this.buttonText='start';
    this.limit=10;

    function fjyb(j) {
      this.asks=j.asks.slice(-this.limit).map(e => [+e[0],+e[1]]);
      this.bids=j.bids.slice(0,this.limit).map(e => [+e[0],+e[1]]);
      this.oasks=this.asks.map(e => [e[0].toFixed(this.priceDigits),e[1].toFixed(this.volDigits)]);
      this.obids=this.bids.map(e => [e[0].toFixed(this.priceDigits),e[1].toFixed(this.volDigits)]);
    }
    function fj(j) {
      this.asks=j.asks.slice(-this.limit);
      this.bids=j.bids.slice(0,this.limit);
      this.oasks=this.asks.map(e => [e[0].toFixed(this.priceDigits),e[1].toFixed(this.volDigits)]);
      this.obids=this.bids.map(e => [e[0].toFixed(this.priceDigits),e[1].toFixed(this.volDigits)]);
    }

    this.depthview.push(new DepthView('snt','cny'));
    this.depthview[0].dia.push(ndi(fjyb,'yunbi'),ndi(fj,'bter'));//,ndi('chbtc'),ndi('jubi'));

    for (let dv of this.depthview) {
      for (let di of dv.dia) {
        di.setSym(dv.syml,dv.symr);
        di.limit=this.limit;
        let api=this.api.get(di.exchange);
        let i;
        switch (di.exchange) {
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
        di.subscribe(api,i);
      }
    }
  }
}
