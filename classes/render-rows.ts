import { HasFormatMethod } from "../interfaces/has-format-method.js";

// generate html string for table rows data and render in browser
export class RenderTableRows implements HasFormatMethod {
	private returnStr = "";
	private arrLength = 0;
	
	constructor( recordsStr: string ){
		let table = document.querySelector('#table') as HTMLDivElement;
		let myArr = JSON.parse(recordsStr);
		
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
			table.append(div);
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