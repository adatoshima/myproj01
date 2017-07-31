import { Injectable, OnInit } from '@angular/core';

export class SubcribeOjbect {

  interval:number;
  _intv:any;
  _func:any;

  stop() {
    clearInterval(this._intv);
    this._intv=null;
  }

  start() {
    if (this._intv!==null) return;
    this._intv=setInterval(this._func,this.interval);
    this._func();
  }

  constructor(func,intv) {
    this._func=func;
    this.interval=intv;
    this._intv=null;
  }
}

class ApiBase {
  baseUrl:string;

  symList:any[];

  makeSym(l:string,r:string): string {return l+r;}

  getSymInfo(l,r) {
    return this.symList.find(e => e.sym===this.makeSym(l,r));
  }
  
  subscribe(op,para,callback) {
    let url=this.opUrl(op);
    let intv=para.interval?para.interval:5000;
    let so=new SubcribeOjbect(() => this.perform(url,callback),para.interval);
    if (!para.nostart) so.start();
    return so;
  }

  opUrl(op) {}

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  perform(url,callback) {
    (window as any).fetch(url)
      .then(resp => resp.json())
      .then(json => callback(json))
      .catch(this.handleError);
  }

  init() { }

  constructor() {this.init();}
}

class ApiYunbi extends ApiBase {
  baseUrl='https://yunbi.com//api/v2/';

  opUrl(op) {
    let sym=op.sym?op.sym:(op.syml&&op.symr?this.makeSym(op.syml,op.symr):'');
    switch (op.cmd) {
      case 'markets':
        return this.baseUrl+'markets.json';
      case 'tickers':
        if (sym) return this.baseUrl+'tickers/'+sym+'.json';
        else return this.baseUrl+'tickers.json';
      case 'depth':
        return this.baseUrl+'depth.json?market='+sym+(op.limit?'&limit='+op.limit:'');
      case 'history':
        let s='trades.json?market='+sym;
        s+=op.limit?'&limit='+op.limit:'';
        s+=op.timestamp?'&limit='+op.timestamp:'';
        s+=op.from?'&limit='+op.from:'';
        s+=op.to?'&limit='+op.to:'';
        s+=op.order_by?'&limit='+op.order_by:'';
        return this.baseUrl+s;
      case '':
        break;      
      default:
        // code...
        break;
    }
  }

  makeSym(left:string,right:string) {
    return (left+right).toLowerCase();
  }

  init() {
    let syms=[
      ['btccny',2],
      ['eoscny',2],
      ['sntcny',3],
      ['qtumcny',3],
      //['eoscny',2],
    ];
    this.symList=syms.map(e => ({sym:e[0],digits:e[1]}));
  };

}

class ApiBter extends ApiBase {
  baseUrl='http://data.bter.com/api2/1/';

  opUrl(op) {
    let sym=op.sym?op.sym:(op.syml&&op.symr?this.makeSym(op.syml,op.symr):'');
    switch (op.cmd) {
      /*
      case 'markets':
        return this.baseUrl+'markets.json';//*/
      case 'tickers':
      case 'ticker':
        if (sym) return this.baseUrl+'ticker/'+sym;
        else return this.baseUrl+'tickers/';
      case 'depth':
        return this.baseUrl+'orderBook/'+sym;
      case 'history':
        return this.baseUrl+'tradeHistory/'+sym;
      case '':
        break;      
      default:
        // code...
        break;
    }
  }

  makeSym(left:string,right:string) {
    return (left+'_'+right).toLowerCase();
  }

  init() {
    let syms=[
      ['btc_cny',2],
      ['eos_cny',2],
      ['snt_cny',3],
      //['eoscny',2],
    ];
    this.symList=syms.map(e => ({sym:e[0],digits:e[1]}));
  };

}

@Injectable()
export class Api {
  api:Map<string,any>;

  get(key:string) {
    return this.api.get(key);
  }
  
  constructor() {
    this.api=new Map([
      ['yunbi',new ApiYunbi()],
      ['bter',new ApiBter()],
    ]);
  }
}