import { Component, OnInit, ViewChild } from '@angular/core';
//import { Http } from '@angular/http';
import { AnnScanComponent } from './annscan';

declare var Notification:any;

@Component({
  selector: 'my-app',
  templateUrl: './main.component.html',
  //styleUrls:[ './depth.component.css',]
})
export class MainComponent implements OnInit {

  @ViewChild('annscan') annscan:AnnScanComponent;

  
  toggleAnn() {
    this.annscan.toggle();
  }//*/

  ngOnInit(): void {
    if ((Notification as any).permission!=='granted') {
      Notification.requestPermission();
    }
  }

}
