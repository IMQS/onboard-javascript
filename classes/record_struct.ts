import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// generate html string for table rows data and render in browser
export class recordStruct implements HasFormatMethod {
	private returnStr: string = "";
	
	constructor( recordsStr: string ){
		const table = document.querySelector('table')!;
		const myArr = JSON.parse(recordsStr);
		
		for(let i=0;i<myArr.length;i++) {
			for(let j=0;j<myArr[i].length;j++) {
				this.returnStr = this.returnStr + "<td>"+myArr[i][j]+"</td>";
			}
			const tr = document.createElement('tr');
			tr.innerHTML = this.returnStr;
			table.append(tr);
			this.returnStr = "";
		}
	}

	format() {
		return this.returnStr;
	}
}