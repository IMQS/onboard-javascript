import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// create table elements and render in browser
export class RenderTableHeading {
    constructor(private container: HTMLDivElement) {}

    constructTableHeadings(element: HasFormatMethod){
        let div = document.createElement('div');
        div.innerHTML = element.internalFormat();
        div.className = "tablecell";
        div.style.gridTemplateColumns = "repeat("+element.arrayLength()+", 1fr)";

        this.container.append(div);
    }
}