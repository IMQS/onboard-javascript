/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    /**
       * This class is used to create the html string containing the column headings of the grid
       * @param returnStr This parameter holds formatted html string containing the column headings to be injected into the DOM
       * @param arrLength This parameter holds length of the array containing the column headings
       * @param myArr This parameter is the array of the parsed string of headings fetched from the back-end
       * @function arrayLength This function returns the length of the array of headings to be rendered
       * @function internalFormat This function returns the formatted html string containing all the column headings
    */
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