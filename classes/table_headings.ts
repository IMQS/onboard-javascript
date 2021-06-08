import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// generate html string for table headings data and render
export class tableHeadings implements HasFormatMethod {
	private returnStr: string = "";

	constructor( headingsStr: string){

		const myArr = JSON.parse(headingsStr);
		for(let i=0;i<myArr.length;i++){
			this.returnStr = this.returnStr + "<th>"+myArr[i]+"</th>";
		}
	}

	format() {
		return this.returnStr;
	}
}