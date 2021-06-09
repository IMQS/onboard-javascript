import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// generate html string for table rows data and render in browser
export class RenderTableRows implements HasFormatMethod {
	private returnStr = "";
	
	constructor( recordsStr: string ){
		let table = document.querySelector('#table') as HTMLDivElement;
		let myArr = JSON.parse(recordsStr);
		
		for(let i=0;i<myArr.length;i++) {
			for(let j=0;j<myArr[i].length;j++) {
				this.returnStr += 
				"<div><p>"+myArr[i][j]+"</p></div>";
			}
			let div = document.createElement('div');
			div.innerHTML = this.returnStr;
			div.className = "tablecell";
			table.append(div);
			this.returnStr = "";
		}
	}

	internalFormat() {
		return this.returnStr;
	}
}