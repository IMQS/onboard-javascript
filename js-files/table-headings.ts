/// <reference path="../has-format-method.ts" />

namespace HasFormatMethod {
    export class RenderTableHeading {
        constructor(private container: HTMLDivElement) {}

        
        constructTableHeadings(hd: HasFormatMethod) {
            let div = document.createElement('div');
            div.innerHTML = hd.internalFormat();
            div.className = "tablecell";
            div.style.gridTemplateColumns = "repeat("+hd.arrayLength()+", 1fr)";

            this.container.append(div);
        }
    }

    export class TableHeadingString implements HasFormatMethod {
        private returnStr = "";
        private arrLength = 0;

        constructor( headingsStr: string){
            let myArr = JSON.parse(headingsStr);
            this.arrLength = myArr.length;

            // Create innerHTML text to be rendered to front-end in the table div
            for(let i=0;i<myArr.length;i++){
                this.returnStr += 
                "<div><p><b>"+myArr[i]+"</b></p></div>";
            }
        }

        // Returns length of array of headings to get number of columns necessary to render
        arrayLength() {
            return this.arrLength;
        }
        
        // Returns formatted string to be placed in html
        internalFormat() {
            return this.returnStr;
        }
    }
}