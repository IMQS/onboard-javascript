/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    /**
       * This class is used to create and render the html string containing the rows of records into the DOM
       * @param returnStr This parameter holds formatted html string containing the rows of records to be injected into the DOM
       * @param arrLength This parameter holds length of the array containing the rows of the records
       * @param records This parameter holds the HTML DIV element with the ID #records
       * @param navigation This parameter holds the HTML DIV element with the ID #navigation
       * @param myArr This parameter is the array of the parsed string of records fetched from the back-end
       * @param headings This parameter holds the HTML DIV element with the ID #headings and is used to edit the style of the headings
       * @param div This parameter is the created div holding the html rows to be injected into the HTML DOM
       * @function arrayLength This function returns the length of the array of rows to be rendered. This length is used in styling the grid
       * @function internalFormat This function returns the formatted html string containing all the rows of records
    */
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