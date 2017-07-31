import { Injectable, OnInit } from '@angular/core';

export class DepthBase {
  exchange:string;
  //depth:any=null;
  _intv:number;
  _interval:any=null;
  baseUrl:string;
  symbol:string;
  onUpdate:any;
  syml:string;
  symr:string;

  get depthUrl() : string {
    return this.baseUrl+this.symbol;
  }

  makeSym(l:string,r:string):string {return '';}

  //last(left:string,right:string):any {return null;}

  setSym(l:string,r:string):void {
    this.syml=l;
    this.symr=r;
    this.symbol=this.makeSym(l,r);
  }

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
    (window as any).fetch(this.depthUrl)
      //.toPromise()
      .then(function (resp) {
        return resp.json();
      })
      .then(json => {
        if (json) {
          //this.depth=json;
          //console.log('dbg1',json);
          this.onUpdate(this,json);
        } else {
          console.log(json);
          debugger;
        }
      })
      .catch(this.handleError);
  }//*/
}

export class YunbiDepth extends DepthBase {
  exchange='yunbi';
  _intv=500;
  baseUrl='https://yunbi.com//api/v2/depth.json?market=';

  makeSym(left:string,right:string) {
    return (left+right).toLowerCase();
  }
}

export class BterDepth extends DepthBase {
  exchange='bter';
  _intv=1000;
  baseUrl='http://data.bter.com/api2/1/orderBook/';

  makeSym(left:string,right:string) {
    return (left+'_'+right).toLowerCase();
  }
}

export class ChbtcDepth extends DepthBase {
  exchange='chbtc';
  _intv=1000;
  baseUrl='http://api.chbtc.com/data/v1/depth?currency=';

  makeSym(left:string,right:string) {
    return (left+'_'+right).toLowerCase();
  }
}

export class JubiDepth extends DepthBase {
  exchange='jubi';
  _intv=1500;
  baseUrl='https://www.jubi.com/api/v1/depth/?coin=';

  makeSym(left:string,right:string) {
    return left.toLowerCase();
  }
}

@Injectable()
export class DepthApi {//implements OnInit {
  apis:Map<string,any>= new Map();
  onUpdate:any;

  init(): void {
    let a,f;
    f=this.update.bind(this);
    a=new YunbiDepth(f);
    this.apis.set('yunbi',a);
    a=new BterDepth(f);
    this.apis.set('bter',a);
    a=new ChbtcDepth(f);
    this.apis.set('chbtc',a);
    a=new JubiDepth(f);
    this.apis.set('jubi',a);
  }

  setSym(l:string,r:string):void {
    for (let api of this.apis.values()) {
      api.setSym(l,r);
    }
  }

  update(ex,data) {
    this.onUpdate(ex,data);
  }

  start() {
    for (let api of this.apis.values()) {
      //console.log(tic);
      api.start();
    }
  }

  stop() {
    for (let api of this.apis.values()) {
      api.stop();
    }
  }

}