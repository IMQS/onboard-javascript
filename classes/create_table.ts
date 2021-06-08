import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

export class createTable {
    constructor(private container: HTMLTableElement) {}

    renderHeading(headings: HasFormatMethod){
        const tr = document.createElement('tr');

        tr.innerHTML = headings.format();
        this.container.append(tr);
    }

    renderRecords(records: HasFormatMethod){
        const tr = document.createElement('tr');
        tr.innerHTML = records.format();

        this.container.append(tr);
    }
}