import { HasFormatMethod } from "../interfaces/has-format-method.js";

// Create table headings and render in browser
export class RenderTableHeading {
    constructor(private container: HTMLDivElement) {}

    constructTableHeadings(hd: HasFormatMethod) {
		let div = document.createElement('div');
        div.innerHTML = hd.internalFormat();
        div.className = "tablecell";
        div.style.gridTemplateColumns = "repeat("+hd.arrayLength()+", 1fr)";

        this.container.append(div);
    }
}