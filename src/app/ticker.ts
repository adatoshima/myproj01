import { Injectable, OnInit } from '@angular/core';
//import { Http } from '@angular/http';
//import { Jsonp } from '@angular/http';
//import {Observable} from 'rxjs/Observable';

//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/catch';

//@Injectable()
export class TickerBase {
  exchange:string;
  ticker:any=null;
  _intv:number;
  _interval:any=null;
  tickerUrl:string;
  onUpdate:any;

  makeSym(l:string,r:string):string {return '';}

  last(left:string,right:string):any {return null;}

  constructor(onUpdate=function(){}){
    this.onUpdate=onUpdate;
  }

  start(): void {
    if (this._interval===null) {
      let that=this;
      this._interval=setInterval(() => this.fetch(),this._intv);
      setTimeout(() => this.fetch(),0);
    }
  }

  stop(): void {
    if (this._interval!==null) {
      clearInterval(this._interval);
      this._interval=null;
    }
  }

  toggle(): void {
    if (this._interval!==null) this.stop();
    else this.start();
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  fetch(): void {
    (window as any).fetch(this.tickerUrl)
      //.toPromise()
      .then(function (resp) {
        return resp.json();
      })
      .then(json => {
        if (json) {
          this.ticker=json;        
          //console.log('dbg1',json);
          this.onUpdate();
        } else {
          console.log(json);
          debugger;
        }
      })
      .catch(this.handleError);
  }//*/

  /*fetch() {
    return this.jsonp.request(this.tickerUrl)
      // .subscribe( res => {
      //   console.log('sub:',res);
      // },
      // err => {
      //   console.log(err);
      // }
      // );
      .map(res => {
       console.log(res);
       return res.json();
      })
      .subscribe(json => {
        console.log(json);
      })
      //.catch((error:any) => Observable.throw(error.json().error || 'Server error'));
      //.catch(this.handleError);
  }//*/
}

//@Injectable()
export class YunbiTicker extends TickerBase {
  exchange='yunbi';
  _intv=1000;
  tickerUrl='https://yunbi.com//api/v2/tickers.json';

  makeSym(left:string,right:string) {
    return (left+right).toLowerCase();
  }

  last(left:string,right:string):any {
    let sym=this.makeSym(left,right);
    if (this.ticker)
      return this.ticker[sym]['ticker']['last'];
    return null;
  }

  lasttime(left:string,right:string) {
    let sym=this.makeSym(left,right);
    if (this.ticker)
      return this.ticker[sym]['at'];
    return null;
  }
}

export class BterTicker extends TickerBase {
  exchange='bter';
  _intv=3000;
  tickerUrl='http://data.bter.com/api2/1/tickers';

  makeSym(left:string,right:string) {
    return (left+'_'+right).toLowerCase();
  }

  last(left:string,right:string):any {
    let sym=this.makeSym(left,right);
    if (this.ticker)
      return this.ticker[sym]['last'];
    return null;
  }

  lasttime(left:string,right:string) {
    let sym=this.makeSym(left,right);
    if (this.ticker)
      return this.ticker[sym]['at'];
    return null;
  }
}

/*
class Tic {
  exchange:string;
  api:TickerBase;
  //tic:any;
  constructor(exchange:string,api:TickerBase) {
    this.exchange=exchange;
    this.api=api;
    //this.tic={};
  }
}//*/

@Injectable()
export class Ticker {//implements OnInit {
  tickers:Map<string,any>= new Map();
  onUpdate=function () {}
  //tic:any[]=[];
  //constructor(private jsonp:Jsonp) {}

/*
  newTic(exchange:string,api:TickerBase) {
    let tic=new Tic(exchange,api);
    tic.api.onUpdate=this.update.bind(this);
    return tic;
  }//*/

  init(): void {
    let t,f;
    f=this.update.bind(this);
    t=new YunbiTicker(f);
    //t.onUpdate=f;
    this.tickers.set('yunbi',t);
    t=new BterTicker(f);
    //t.onUpdate=f;
    //this.tickers.set('yunbi',t));
    this.tickers.set('bter',t);
  }

  update() {
    this.onUpdate();
    // for (let tic of this.tickers) {
    //   for (let sym in tic.api.ticker) {
    //     tic['tic'][sym]=tic[sym]['last'];
    //   }
    // }
  }

  start() {
    for (let tic of this.tickers.values()) {
      //console.log(tic);
      tic.start();
    }
  }

  stop() {
    for (let tic of this.tickers.values()) {
      tic.stop();
    }
  }

}