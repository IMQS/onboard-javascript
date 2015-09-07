/// <reference path="jquery.d.ts" />

class Load {
    //The base div
    private container: HTMLElement;
    //The table used to display the data from the WS
    private table: HTMLTableElement;
    //The data from the WS
    private data: Array<string>;
    //The number of records of data
    private recordCount: number = 100;
    //The start index used to denote from which index we fetch the data from
    fromN: number = 0;
    //The end index used to denote to which index we fetch the data from
    toN: number = 29;
    //Number of rows on a page
    private rowMax: number = 30;
    private previousTo: number;

    //Instantiates the class
    constructor(container: HTMLElement, table: HTMLTableElement) {
        this.container = container;
        this.table = table;
    }

    //Loads the column headers from the WS
    loadColumnsHeaders() {
        $.getJSON("http://localhost:2050/columns",
            cols => {
                this.createColumnsHeaders(cols);
            });
    }

    //Load the record count
    loadRecordCount() {
        $.getJSON("http://localhost:2050/recordCount",
            count => {
                this.recordCount = count;
            });
    }

    //Load the data which gets returned in an [][]
    loadData(fromN: number, toN: number) {
        $.getJSON("http://localhost:2050/records?from=" + fromN + "&to=" + toN,
            data => {
                this.createRows(data);
            });
    }

    //Creates the column headers from the cols paramter
    createColumnsHeaders(cols: Array<string>) {
        var row = document.createElement("tr");

        for (var i = 0; i < cols.length; i++) {
            var colName = cols[i];

            var col = document.createElement("td");
            col.textContent = colName;
            col.style.textAlign = "center";
            col.style.fontWeight = "bold";
            col.style.fontSize = "150%";
            row.appendChild(col);
        }

        this.table.appendChild(row);
    }

    //Creates cells and rows from the multi-dimensional array data parameter
    createRows(data: string[][]) {
        for (var i = 0; i < data.length; i++) {
            var row = document.createElement("tr");
            for (var n = 0; n < data[i].length; n++) {
                var col = document.createElement("td");
                var text = data[i][n];
                col.textContent = text;
                col.style.textAlign = "center";
                col.style.fontSize = "100%";
                row.appendChild(col);
            }
            this.table.appendChild(row);
        }
    }

    //Registers click events for next and previous buttons
    registerClicks(loader: Load, container: HTMLElement, table: HTMLTableElement) {
        var prev = document.getElementById('prev_page');
        prev.addEventListener('click', e => {
            if (this.toN == this.recordCount) {
                this.toN += this.previousTo;
            }
            if (this.fromN > 0) {
                this.removeTableDataRows(table);
                this.fromN -= this.rowMax;
                this.toN -= this.rowMax;
                this.loadData(this.fromN, this.toN);
            }
        });

        var next = document.getElementById('next_page');
        next.addEventListener('click', e => {
            this.fromN += this.rowMax;
            this.toN += this.rowMax;
            this.removeTableDataRows(table);
            if (this.toN <= this.recordCount) {
                this.loadData(this.fromN, this.toN);
            }
            else {
                var diff = this.toN - this.recordCount;
                this.previousTo = diff;
                this.toN = this.recordCount;
                this.loadData(this.fromN, this.toN);
            }
        });
    }

    //Removes all the data rows (not column headers) from the table
    removeTableDataRows(table: HTMLTableElement) {
        var rows = table.rows.length;
        for (var i = (rows - 1); i > 0; i--) {
            table.deleteRow(i);
        }
    }
}

window.onload = () => {
    var container = document.getElementById('container');
    var table = <HTMLTableElement>document.getElementById('table');

    var load = new Load(container, table);
    //load.loadRecordCount();
    load.loadColumnsHeaders();
    load.loadData(load.fromN, load.toN);
    load.registerClicks(load, container, table);
};