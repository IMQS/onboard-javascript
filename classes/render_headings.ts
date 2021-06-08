import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// create table elements and render in browser
export class RenderTableHeading {
    constructor(private container: HTMLTableElement) {}

    constructTableHeadings(element: HasFormatMethod){
        let tr = document.createElement('tr');
        tr.innerHTML = element.internalFormat();

        this.container.append(tr);
    }
}