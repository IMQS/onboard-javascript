import { HasFormatMethod } from "../interfaces/has-format-method.js";

// Create table headings and render in browser
export class RenderTableHeading {
    constructor(private container: HTMLDivElement) {}

    constructTableHeadings(element: HasFormatMethod) {
        // let myArr = JSON.parse(recordsStr);	
        // // CSS
		// let headings = document.querySelector('#headings') as HTMLDivElement;				// Target div element with ID table
		// headings.style.display = "grid";
		// headings.style.gridTemplateRows = "repeat(auto-fill, "+(100/(myArr.length+3))+"%)";

        let div = document.createElement('div');
        div.innerHTML = element.internalFormat();
        div.className = "tablecell";
        div.style.gridTemplateColumns = "repeat("+element.arrayLength()+", 1fr)";

        this.container.append(div);
    }
}