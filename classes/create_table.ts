import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

// create table elements and render in browser
export class createTable {
    constructor(private container: HTMLTableElement) {}

    constructTableHeadings(element: HasFormatMethod){
        const tr = document.createElement('tr');
        tr.innerHTML = element.format();

        this.container.append(tr);
    }
}