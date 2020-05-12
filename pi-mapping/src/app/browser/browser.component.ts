import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import clusterMap from "../../assets/cluster_map.json";
import clusterMap2019 from "../../assets/cluster_map_2019.json";
import { PapersService } from '../papers.service';
import { TagsService } from '../tags.service';
import { RenameService } from '../rename.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
})
export class BrowserComponent implements OnInit {
	codes:string[];
	clusters:{} = {};
	checked:{} = {};
	counts:{} = {};
	paperList:string[] = [];
	search:string;
  hidden:{} = {};
  yearRadio:boolean = true;
  clusterMap:any;

  constructor(private papers:PapersService, private tags:TagsService, private rename:RenameService) {
    this.clusterMap = clusterMap;
    if(environment.showOldData) {
      this.clusterMap = clusterMap2019;
    }
  }

  ngOnInit() {
  	this.codes = this.clusterMap.map(c => c['title']);
  	this.codes.forEach(c => {
      let cm = this.clusterMap.filter(m => c == m['title'])[0];
  		this.clusters[c] = cm['clusters'];
  		this.checked[c] = {};
      this.hidden[c] = true;
  		cm['clusters'].forEach(cm => {
  			let ids = this.tags.getIdsForTag(cm);
  			if(ids) {
  				this.counts[cm] = ids.length;
  			} else {
  				this.counts[cm] = 0;
  			}
  		});
  		this.clusters[c].sort((a, b) => this.counts[b] - this.counts[a]);
  	});
  	this.paperList = this.papers.getAllPapers();
  }

  clear() {
    this.codes.forEach(c => {
      this.checked[c] = {};
    });
    this.search = null;
    this.check();
  }

  getName(code:string) {
    return this.rename.getCodeName(code);
  }

  toggleHide(code:string) {
    this.hidden[code] = !this.hidden[code];
  }

  checkBoxes():string[] {
  	let papersSoFar = this.papers.getAllPapers();
  	
  	this.codes.forEach(code => {
  		let papersForCode = [];
  		Object.keys(this.checked[code]).forEach(k => {
  			if(this.checked[code][k]) {
  				papersForCode = papersForCode.concat(this.tags.getIdsForTag(k));
  			}
  		});
  		if(papersForCode.length > 0) {
  			papersSoFar = papersSoFar.filter(p => papersForCode.includes(p));
  		}
  	});

  	return papersSoFar;
  }

  check() {
	this.paperList = this.checkBoxes();
  }

  searchFor() {
  	let searchList = this.papers.filterBy(this.search);
  	this.paperList = this.checkBoxes().filter(p => searchList.includes(p));
  }

}
