import { HasFormatMethod } from "../interfaces/has-format-method.js";

// generate html string for table rows data and render in browser
export class RenderTableRows implements HasFormatMethod {
	private returnStr = "";
	private arrLength = 0;
	
	constructor( recordsStr: string ){
		// let table = document.querySelector('#table') as HTMLDivElement;				// Target div element with ID table
		let records = document.querySelector('#records') as HTMLDivElement;				// Target div element with ID table
		let navigation = document.querySelector('#navigation') as HTMLDivElement;	// Target div element with ID navigation
		let myArr = JSON.parse(recordsStr);											// Parse the string to create array of the data

		// Edit styling of the table and navigation bar
		records.style.display = "grid";
		records.style.gridTemplateRows = "repeat(auto-fill, "+(100/(myArr.length+3))+"%)";
		navigation.style.height = (100/(myArr.length+3))+"%";
		
		// Create innerHTML text to be rendered to front-end in the table div
		for(let i=0;i<myArr.length;i++) {
			for(let j=0;j<myArr[i].length;j++) {
				this.arrLength = myArr[i].length;
				this.returnStr += 
					"<div><p>"+myArr[i][j]+"</p></div>";
			}

			// Append innerHTML text to div element in front-end
			let div = document.createElement('div');
			div.innerHTML = this.returnStr;
			div.className = "tablecell";
			div.style.gridTemplateColumns = "repeat("+this.arrLength+", 1fr)";
			records.append(div);
			this.returnStr = "";
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