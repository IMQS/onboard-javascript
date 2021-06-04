import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

export class createTable {
    constructor(private container: HTMLTableElement) {}

    renderHeading(headings: HasFormatMethod){
        const th = document.createElement('th');
        th.innerHTML = headings.format();

        array.forEach(element => {
            this.container.append(th);
        });
    }

    renderRecords(records: HasFormatMethod){
        const tr = document.createElement('tr');
        tr.innerHTML = records.format();

        this.container.append(tr);
    }
} 
