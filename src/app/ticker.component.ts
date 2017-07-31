import { Component, OnInit } from '@angular/core';
//import { Http } from '@angular/http';
import { Ticker }    from './ticker';
import 'rxjs/add/operator/toPromise';

/*class PriXhg {
  price:any;
  //exchange:string;
  op:any;
  constructor(price:any,exchange:string) {
    this.price=price;
    this.exchange=exchange;
    this.op='';
  }
}//*/

class TicView {
  syml:string;
  symr:string;
  pxa:any[];
  //exchanges:any[];
  constructor(left:string,right:string) {
    this.syml=left;
    this.symr=right;
    this.pxa=[];
  }
  get sym() : string {
    return (this.syml+this.symr).toLowerCase();
  }
}

@Component({
  selector: 'my-app',
  templateUrl: './ticker.component.html',
  //styleUrls:[ './ticker.component.css',]
})
export class TickerComponent implements OnInit { 
  
  tickerArray = [100,200,300];

  //ticker=new Map();

  buttonText:string;

  tview:TicView[]=[];

  //yt= new yunbiTicker();

  //constructor(private yt:YunbiTicker){}
  constructor(private ticker:Ticker){}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  toggle(): void {
    if (this.buttonText=='start') {
      this.buttonText='stop';
      this.ticker.start();
    } else {
      this.buttonText='start';
      this.ticker.stop();
    }
  }

  update() {
    let tks=this.ticker.tickers;
    for (let tv of this.tview) {
      let tp=tv.pxa;
      for (let px of tp) {
        let tk=tks.get(px.exchange);
        let p=tk.last(tv.syml,tv.symr);
        if (!p) continue;
        px.price=p;
      }
      let l=tp.length;
      if (l<1) continue;
      let p0=+tp[0].price;
      if (!(p0>0)) continue;
      tp[0].op='-';
      for (let i=1;i<l;i++) {
        let p=100*(+tp[i].price)/p0-100;
        tp[i].op=p.toFixed(2);
      }//*/
      /*let i=0;
      let tp=tv.pxa;
      for (let tic of tks) {
        let p=tic.api.last(tv.syml,tv.symr);
        if (!p) continue;
        if (!tp[i]) tp[i]=new PriXhg(p,tic.exchange);
        else {tp[i].price=p;tp[i].exchange=tic.exchange;}
        if (i==0 && tic.exchange=='bter') debugger;
        i++;
      }
      let l=tv.pxa.length;
      if (l<1) continue;
      let p0=+tp[0].price;
      if (!(p0>0)) continue;
      tv.pxa[0].op='-';
      for (let i=1;i<l;i++) {
        let p=100*(+tp[i].price)/p0-100;
        tp[i].op=p.toFixed(2);
      }//*/

      /*tv.pxa.length=0;
      for (let tic of tks) {
        let px=new PriXhg(tic.api.last(tv.syml,tv.symr),tic.exchange);
        if (!px.price) continue;
        tv.pxa.push(px);
      }
      let l=tv.pxa.length;
      if (l<1) continue;
      let p0=+tv.pxa[0].price;
      if (!(p0>0)) continue;
      tv.pxa[0].op='-';
      for (let i=1;i<l;i++) {
        let p=100*(+tv.pxa[i].price)/p0-100;
        tv.pxa[i].op=p.toFixed(2);
      }//*/
    }
  }

  ngOnInit(): void {
    this.buttonText='start';
    this.ticker.init();
    this.ticker.onUpdate=this.update.bind(this);
    this.tview.push(new TicView('eos','cny'));
    this.tview[0].pxa.push({exchange:'yunbi'},{exchange:'bter'});
  }
}
