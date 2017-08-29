import { Injectable, OnInit } from '@angular/core';
import * as UF from './utilFunctions';

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

export class SubcribeOjbectEx {
  api:any;
  wi:Array<any>;
}

const symYunbi = [
      ['vencny',3,3],
      ['btccny',2,4],
      ['bcccny',2,4],
      ['eoscny',2,2],
      ['ethcny',2,2],
      ['sntcny',3,2],
      ['qtumcny',3,3],
      ['1stcny',3,2],
      ['anscny',3,2],
      ['btscny',4,2],
      ['sccny',5,0],
      ['gxscny',3,2],
      ['omgcny',3,3],
      ['luncny',3,3],
      ['paycny',3,3],
];

const symBter = [
      ['zrx_cny',4,3],
      ['ven_cny',3,3],
      ['pay_cny',2,3],
      ['cvc_cny',3,2],
      ['btm_cny',3,2],
      ['btc_cny',2,4],
      ['bcc_cny',2,4],
      ['eos_cny',2,2],
      ['eth_cny',2,4],
      ['snt_cny',3,2],
      ['qtum_cny',2,3],
      ['bts_cny',4,2],
      ['etc_cny',3,3],
      ['ltc_cny',2,4],
      ['oax_eth',8,2],
      ['oax_btc',8,2],
];

const symLiqui = [
      'zrx_eth',
      'stx_eth',
      'oax_eth',
      'eth_usdt',
      'tnt_eth',
];

const symJubi = [
      ['elc',6,1],
];

export const exchange=[
  'jubi',
  'yunbi',
  'bter',
  'chbtc',
  'btc9',
  'liqui',
];

class Task {
  id:number;
  fn:any;
  constructor(argument) {
    // code...
  }
}

class ArrayEx<T> extends Array<T> {
  remove(e) {
    let i=this.indexOf(e);
    if (i>=0) this.splice(i,1);
  }

  removeAll(e) {
    let i;
    while ((i=this.indexOf(e))>=0) {
      this.splice(i,1);
    }
  }
}

class ApiWorker {
  //sym:string;
  //task:string;
  url:string;
  interval:number;
  _intv:any;
  //pool:ArrayEx;
  maxTasks:number;
  callbackList:Map<number,any>;
  last:Date;

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  res(json) {
    if (!this.callbackList.size) {
      //clearInterval(this._intv);
      //this.pool.remove(this);
      return;
    }
    for (let fn of this.callbackList.values()) {
      fn(json);
    }
  }

  req() {
    (window as any).fetch(this.url)
      .then(resp => {
        switch (resp.status) {
          case 200:
            resp.json().then(json => this.res(json));
            break;
          case 204:
          case 304:
            return;
          default:
            console.log(UF.timestr(new Date()),'error:',resp.statusText);
            return;
        }
      })
      //.then(json => this.res(json))
      .catch(this.handleError);
  }

  addTask(fn):number {
    let cl=this.callbackList;
    if (cl.size>=this.maxTasks) return -1;
    let id;
    do {
      id=Math.random();
    } while (cl.has(id));
    cl.set(id,fn);
    return id;
  }

  /*retruns number of tasks*/
  removeTask(id:number):number {
    let cl=this.callbackList;
    cl.delete(id);
    if (!cl.size) this.stop();
    return cl.size;
  }

  start() {
    if (this._intv!==null) return;
    this._intv=setInterval(this.req.bind(this),this.interval);
    this.req();
  }

  stop() {
    clearInterval(this._intv);
    this._intv=null;
  }

  constructor() {
    this._intv=null;
    this.callbackList=new Map();
  }
}

function naw():ApiWorker {
  let aw=new ApiWorker();
  return aw;
}

class ApiBase {
  baseUrl:string;

  symList:any[];

  makeSym(l:string,r:string): string {return l+r;}

  workers:ArrayEx<ApiWorker>;//Set<ApiWorker>=new Set();

  maxTasks:number;

  minIntv:number;

  inited:boolean;

  getSymList() {
    return this.symList;
  }

  /*
  getSymInfo(l,r) {
    return this.symList.find(e => e.sym===this.makeSym(l,r));
  }//*/

  getSymInfo(sym:any) {
    if (!this.inited) return null;
    if (typeof sym === 'string') return this.symList.find(e => e.sym===sym);
    if (sym.sym) return this.symList.find(e => e.sym===sym.sym);
    else return this.symList.find(e => e.sym===this.makeSym(sym.syml,sym.symr));
  }
  
  subscribe(op,para,callback) {
    if (!this.inited) return null;
    let url=this.opUrl(op);
    let intv=para.interval?para.interval:5000;
    let so=new SubcribeOjbect(() => this.perform(url,callback),para.interval);
    if (!para.nostart) so.start();
    return so;
  }

  subscribeEx(op,para,callback) {
    if (!this.inited) return null;
    let url=this.opUrl(op);
    let aw=this.workers.find(aw => aw.url===url);
    if (!aw) {
      aw=naw();
      aw.url=url;
      aw.maxTasks=this.maxTasks;
      aw.interval=this.minIntv;
      this.workers.push(aw);
    }
    let id=aw.addTask(callback);
    aw.start();
    if (id<0) {
      url='';
      console.log('unable to add task to worker.');
    }
    return [id,url];
  }

  unsubscribeEx(wi) {
    let aw=this.workers.find(aw => aw.url===wi[1]);
    if (aw) {
      if (aw.removeTask(wi[0])===0)
        this.workers.remove(aw);
    }
  }

  opUrl(op):string {return '';}

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

  init() {}

  constructor() {
    this.workers=new ArrayEx<ApiWorker>();
    //this.init();
  }
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
    this.maxTasks=10;
    this.minIntv=1000;
    this.symList=symYunbi.map(e => ({sym:e[0],digits:e[1],vdigits:e[2]}));
    this.inited=true;
  };

}

class ApiBter extends ApiBase {
  baseUrl='http://data.bter.com/api2/1/';
  info:any;

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
        return 'https://bter.com/json_svr/query/?u=11&type=ask_bid_list_table&symbol='+sym;
        //return this.baseUrl+'orderBook/'+sym;
      case 'history':
        return 'https://bter.com/json_svr/query/?u=11&type=ask_bid_list_table&symbol='+sym;
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
    this.maxTasks=10;
    this.minIntv=2500;
    this.symList=symBter.map(e => ({sym:e[0],digits:e[1],vdigits:e[2]}));
    this.inited=true;
  };

}

class ApiLiqui extends ApiBase {

  baseUrl='https://api.liqui.io/api/3/';

  inited=false;

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
        return this.baseUrl+'depth/'+sym;
        //return this.baseUrl+'orderBook/'+sym;
      case 'history':
        return this.baseUrl+'trades/'+sym;
      case 'info':
        return this.baseUrl+'info';
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
    this.maxTasks=10;
    this.minIntv=2500;
    //this.symList=[];
    //this.symList=symBter.map(e => ({sym:e[0],digits:e[1],vdigits:e[2]}));
    this.initInfo();
  };

  initInfo() {
    function func(j) {
      this.info=j;
      let jp=j.pairs;
      this.symList=[];
      for (let k of Object.keys(jp)) {
        if (symLiqui.includes(k)) 
          this.symList.push({
            sym:k,
            digits:8,
            vdigits:8,
          })
      }
      this.inited=true;
    }
    //this.symList=[];
    this.perform(this.opUrl({cmd:'info'}),func.bind(this));
  }
}

class ApiJubi extends ApiBase {
  baseUrl='https://www.jubi.com/api/v1/';
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
        //return 'https://www.jubi.com/coin/'+sym+'/trades';
        return this.baseUrl+'depth/?coin='+sym;
      case 'history':
        return this.baseUrl+'orders/?coin='+sym;
        //return 'https://www.jubi.com/coin/'+sym+'/order';
      case '':
        break;      
      default:
        // code...
        break;
    }
  }

  makeSym(left:string,right:string) {
    return left.toLowerCase();
  }

  init() {
    this.maxTasks=10;
    this.minIntv=1000;
    this.symList=symJubi.map(e => ({sym:e[0],digits:e[1],vdigits:e[2]}));
    this.inited=true;
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
      ['jubi',new ApiJubi()],
      ['liqui',new ApiLiqui()],
    ]);
    for (let api of this.api.values()) {
      api.init();
    }
  }
}