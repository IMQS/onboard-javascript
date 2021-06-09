import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// generate html string for table headings data
export class TableHeadingString implements HasFormatMethod {
	private returnStr = "";

	constructor( headingsStr: string){
		let myArr = JSON.parse(headingsStr);
		for(let i=0;i<myArr.length;i++){
			this.returnStr += 
			"<div><p><b>"+myArr[i]+"</b></p></div>";
		}
	}

	internalFormat() {
		return this.returnStr;
	}
}