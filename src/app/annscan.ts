import { Component, OnInit, OnDestroy } from '@angular/core';
import { timestr,dtstr } from './utilFunctions'

declare var Notification:any;
declare var fetch:any;

class HSObject {
    list:string;
    title:string;
    link:string;
    time:string;
    summary:string;
}

class ScannerUrls {
    base:string;
    ann:string;
    icon:string;
}

class AnnScanner {
  init:any={headers:{'Accept-Language':'zh-CN'}};
  buf:any;
  last:any;
  _intv:any;
  interval:number;
  strings:any;
  urls:ScannerUrls;
  annlist:any[];

  notiOp(o):any {return {};}

  diff(e:any) {
    let op=this.notiOp(e);
    let ntf=new Notification(op.title,op);
    ntf.onclick= (e) => {
      e.preventDefault();
      window.open(op.url,'_blank');
      ntf.close();
    }
    console.log(op.logger,op.url);
    op._ts='[time scanned:'+dtstr(new Date())+']';
    this.annlist.push(op);
  };

  scan() {
    fetch(this.urls.ann,this.init)
      .then(r => r.text())
      .then(s => {
        this.buf=s;
        this.check();
      })
      .catch(r => console.log(r));
  }

  check() { }

  start () {
    if (this._intv!==null) clearInterval(this._intv);
    this._intv=setInterval(this.scan.bind(this),this.interval);
    this.scan();
  }

  stop() {
    clearInterval(this._intv);
    this._intv=null;
  }

  constructor() {
    this._intv=null;
  }
}

class HtmlAnnScanner extends AnnScanner {

  htmlselector:HSObject;

  scan() {
    fetch(this.urls.ann,this.init)
      .then(r => r.text())
      .then(s => {
        this.buf=s;
        this.check();
      })
      .catch(r => console.log(r));
  }

  notiOp(e:Element) {
    let hs=this.htmlselector;
    let op:any={};
    let a=e.querySelector(hs.title);
    op.title=this.strings.exg+a.textContent.trim();
    op.body='';
    if (hs.time) op.body=e.querySelector(hs.time).textContent.trim();
    if (hs.summary)
      op.body+='\n'+e.querySelector(hs.summary).textContent.trim();
    if ((hs as any).image) op.image=e.querySelector((hs as any).image).src;
    op.icon=this.urls.icon;
    op.url=this.urls.base+a.getAttribute('href');
    op.logger=this.strings.newann;
    op.requireInteraction=true;
    return op;
  }

  check() {
    let hs=this.htmlselector;
    let p=(new DOMParser()).parseFromString(this.buf,'text/html');
    let annlist=Array.from(
      p.querySelector(hs.list).children);
    let lastlink=annlist[0].querySelector(hs.link).getAttribute('href');
    if (this.last) {
      if (lastlink===this.last) return;
      for (let ch of annlist) {
        let link=ch.querySelector(hs.link).getAttribute('href');
        if (link===this.last) break;
        this.diff(ch);
      }
    } else {
      let op=this.notiOp(annlist[0]);
      op._ts='[time scanned:'+dtstr(new Date())+']';
      this.annlist.push(op);
      console.log(this.strings.firstrun,lastlink);
    }
    this.last=lastlink;
  }

  testfunc() {
    let temp=this.check;
    this.check= () => {
      let p=(new DOMParser()).parseFromString(this.buf,'text/html');
      let e=p.querySelector(this.htmlselector.list)
          .firstElementChild;
      this.diff(e);
      this.check=temp;
    }
    this.scan();
  }
}

class BterScanner extends HtmlAnnScanner {
  
  urls={
    base:'https://bter.com',
    ann:'https://bter.com/articlelist/ann',
    icon:'files/bter.ico',
  };
  htmlselector={
    list:'#lcontentnews',
    title:'a',
    link:'a',
    time:'#updated',
    summary:'.news-brief',
  };
  strings={
    exg:'[bter]',
    newann:'bter new ann:',
    firstrun:'bter scanner working. latest ann link:',
  };
}

class BithumbScanner extends HtmlAnnScanner {
  
  urls={
    base:'',
    ann:'http://bithumb.cafe/notice',
    icon:'files/bithumb.ico',
  };
  htmlselector={
    list:'.portfolio-content',
    title:'.entry-title a',
    link:'a',
    time:null,
    summary:null,
    image:'img',
  };
  strings={
    exg:'[bithumb]',
    newann:'bithumb new ann:',
    firstrun:'bithumb scanner working. latest ann link:',
  };
}

class ZendeskScanner extends AnnScanner {

  recent:any[]=[];

  notiOp(a:any) {
    let op:any={};
    op.title=this.strings.exg+a.breadcrumbs[1].name+':'+a.title;
    op.body=dtstr(new Date(a.timestamp));
    op.icon=this.urls.icon;
    op.url=this.urls.base+a.url;
    op.logger=this.strings.newann;
    op.requireInteraction=true;
    return op;
  }

  scan() {
    fetch(this.urls.ann,this.init)
      .then(r => r.json())
      .then(j => {
        this.buf=j;
        this.check();
      })
      .catch(r => console.log(r));
  }

  check() {
    let annlist=this.buf.activities;
    let lastid=annlist[0].id;
    if (this.recent.length) {
      //if (lastid===this.last) return;
      if (this.recent.includes(lastid)) return;
      for (let act of annlist) {
        //if (act.id===this.last) break;
        if (this.recent.includes(act.id)) break;

        this.diff(act);
      }
    } else {
      let op=this.notiOp(annlist[0]);
      op._ts='[time scanned:'+dtstr(new Date())+']';
      this.annlist.push(op);
      console.log(this.strings.firstrun,lastid);
    }
    //this.last=lastid;
    this.recent=annlist.map(e => e.id);
    this.buf=null;
  }

  testfunc() {
    let temp=this.check;
    this.check= () => {
      this.diff(this.buf.activities[0]);
      this.buf=null;
      this.check=temp;
    }
    this.scan();
  }  
}

class YunbiScanner extends ZendeskScanner {
  
  urls={
    base:'https://yunbi.zendesk.com',
    ann:'https://yunbi.zendesk.com/hc/api/internal/recent_activities?locale=zh-cn',
    icon:'files/yunbi.ico',
  };
  strings={
    exg:'[yunbi]',
    newann:'yunbi new ann:',
    firstrun:'yunbi scanner working. latest ann link:',
  };
}

class BinanceScanner extends ZendeskScanner {
  
  urls={
    base:'https://binance.zendesk.com',
    ann:'https://binance.zendesk.com/hc/api/internal/recent_activities?locale=zh-cn',
    icon:'files/binance.ico',
  };
  strings={
    exg:'[binance]',
    newann:'binance new ann:',
    firstrun:'binance scanner working. latest ann link:',
  };
}

class ChbtcScanner extends HtmlAnnScanner {
  
  urls={
    base:'https://www.chbtc.com',
    ann:'https://www.chbtc.com/i/blog',
    icon:'files/chbtc.ico',
  };
  htmlselector={
    list:'ul.cbp_tmtimeline',
    title:'header a',
    link:'header a',
    time:'time',
    summary:null,
  };
  strings={
    exg:'[chbtc]',
    newann:'chbtc new ann:',
    firstrun:'chbtc scanner working. latest ann link:',
  };

  notiOp(e:Element) {
    let hs=this.htmlselector;
    let op:any={};
    let a=e.querySelector(hs.title);
    op.title=this.strings.exg+a.textContent.trim();
    op.body=e.querySelector(hs.time).getAttribute('datetime');
    op.icon=this.urls.icon;
    op.url=this.urls.base+a.getAttribute('href');
    op.logger=this.strings.newann;
    op.requireInteraction=true;
    return op;
  }
}

class JubiScanner extends HtmlAnnScanner {
  
  htmlselector={
    list:'.new_list>ul',
    title:'a.title',
    link:'a.title',
    time:'span.list_time',
    summary:'p.list_neirong',
  };
  strings={
    exg:'[jubi]',
    newann:'jubi new ann:',
    firstrun:'jubi scanner working. latest ann link:',
  };
  urls={
    base:'https://www.jubi.com',
    ann:'https://www.jubi.com/gonggao/',
    icon:'files/jubi.ico',
  };
}

class Btc9Scanner extends HtmlAnnScanner {
  
  htmlselector={
    list:'div.col-xs-10 tbody',
    //list:'ul.list-group',
    title:'a.pull-left',
    link:'a.pull-left',
    //time:'span.pull-right',
    time:'td:last-child',
    summary:null,
  };
  strings={
    exg:'[btc9]',
    newann:'btc9 new ann:',
    firstrun:'btc9 scanner working. latest ann link:',
  };
  urls={
    base:'https://www.btc9.com',
    ann:'https://www.btc9.com/Art/index/id/1.html',
    icon:'files/btc9.ico',
  };
}

@Component({
  selector:'annscan-comp',
  templateUrl:'./annscan.component.html',
  styleUrls:[
    './annscan.component.css',
  ],
})
export class AnnScanComponent implements OnInit {
  scanner:AnnScanner[];
  annlist:any[]=[];
  hidden:boolean;

  show() {
    this.hidden=false;
  }

  hide() {
    this.hidden=true;
  }

  toggle() {
    this.hidden=!this.hidden;
  }

  entryClick(url) {
    window.open(url,'_blank');
  }

  moclick(e:MouseEvent) {
    if (e.currentTarget===e.target) this.hide();
  }

  ngOnInit() {
    this.scanner=[
      new BterScanner(),
      new YunbiScanner(),
      new ChbtcScanner(),
      new JubiScanner(),
      new Btc9Scanner(),
      new BinanceScanner(),
      new BithumbScanner(),
      ];
    for (let s of this.scanner) {
      s.interval=10000;
      s.start();
      s.annlist=this.annlist;
      //(s as any).testfunc();
    }
    //(this.scanner[6] as any).testfunc();
  }

  ngOnDestory() {
    for (let s of this.scanner) {
      s.stop();
    }
  }

  constructor() {
    this.hidden=true;
  }
}
/*
function fzh(u,o) {
    let headers={'Accept-Language':'zh-CN'}
    fetch(u,{headers:headers})
      .then(r => r.text())
      .then(s => o.t=s)
      .catch(e => console.log(e));
}

function fjs(u,o,i={}) {
    fetch(u,i)
      .then(r => r.json())
      .then(s => o.j=s)
      .catch(e => console.log(e));
}//*/