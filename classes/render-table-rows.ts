/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    export class RenderTableRows implements HasFormatMethod {
        private returnStr = "";
        private arrLength = 0;
        
        constructor( recordsStr: string ){
            let records = document.querySelector('#records') as HTMLDivElement;			
            let navigation = document.querySelector('#navigation') as HTMLDivElement;	
            let myArr = JSON.parse(recordsStr);											

            records.style.display = "grid";
            records.style.gridTemplateRows = "repeat(auto-fill, "+(100/(myArr.length+2))+"%)";
            records.style.height = "100%";
            navigation.style.height = (100/(myArr.length+2))+"%";
            let headings = document.querySelector('#headings') as HTMLDivElement;
            headings.style.height = 100/(myArr.length+2)+"%";
            
            for(let i=0;i<myArr.length;i++) {
                for(let j=0;j<myArr[i].length;j++) {
                    this.arrLength = myArr[i].length;
                    this.returnStr += 
                        "<div><p>"+myArr[i][j]+"</p></div>";
                }

                let div = document.createElement('div');
                div.innerHTML = this.returnStr;
                div.className = "tablecell";
                div.style.gridTemplateColumns = "repeat("+this.arrLength+", 1fr)";
                records.append(div);
                this.returnStr = "";
            }
        }

        arrayLength() {
            return this.arrLength;
        }

        internalFormat() {
            return this.returnStr;
        }
    }
}