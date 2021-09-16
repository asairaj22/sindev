import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringUtilService {
 	
     constructor() { }
     
     getRandomId(){ //Prototype to generate random number
        var d = Date.now();
        return "xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
    }

    replaceAll(replaceStr: string, replaceFrom: string, replaceTo: string) {
      return replaceStr.replace(new RegExp(replaceFrom, 'g'), replaceTo);
    }

    getDocumentObject(id: string){ //Prototype to get the document object
      var docDom = document;
      return docDom.getElementById(id);
    }

    trimLeft(str: string){
      return str.replace(/^\s+/,"");
    }
}