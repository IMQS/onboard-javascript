import { HasFormatMethod } from "../interfaces/has-format-method.js";

// generate html string for table headings data
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