/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    export class TableHeadingString implements HasFormatMethod {
        private returnStr = "";
        private arrLength = 0;

        constructor( headingsStr: string){
            let myArr = JSON.parse(headingsStr);
            this.arrLength = myArr.length;

            for(let i=0;i<myArr.length;i++){
                this.returnStr += 
                "<div><p><b>"+myArr[i]+"</b></p></div>";
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