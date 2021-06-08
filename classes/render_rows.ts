import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// generate html string for table rows data and render in browser
export class RenderTableRows implements HasFormatMethod {
	private returnStr = "";
	
	constructor( recordsStr: string ){
		let table = document.querySelector('#table') as HTMLTableElement;
		let myArr = JSON.parse(recordsStr);
		
		for(let i=0;i<myArr.length;i++) {
			for(let j=0;j<myArr[i].length;j++) {
				this.returnStr += 
				"<td>"+myArr[i][j]+"</td>";
			}
			let tr = document.createElement('tr');
			tr.innerHTML = this.returnStr;
			table.append(tr);
			this.returnStr = "";
		}
	}

	internalFormat() {
		return this.returnStr;
	}
}