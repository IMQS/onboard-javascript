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
    toN: number = 0;
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
        var ws = $.getJSON("http://localhost:2050/columns",
            cols => {
                this.createColumnsHeaders(cols);
            });
        ws.done(function () {
            console.log("Loading column data success");
        });
        ws.fail(function () {
            alert("An error occurred loading column data");
        });
    }

    //Load the record count
    loadRecordCount() {
        var ws = $.getJSON("http://localhost:2050/recordCount",
            count => {
                this.recordCount = count;
            });
        ws.done(function () {
            console.log("Load record data count success");
        });
        ws.fail(function () {
            alert("An error occurred loading record data count");
        });
    }

    //Load data, which gets returned in an [][]
    loadData(fromN: number, toN: number, calculateRowCount: boolean, create: boolean) {
        var ws = $.getJSON("http://localhost:2050/records?from=" + fromN + "&to=" + toN,
            data => {
                if (create) {
                    this.createRows(data, fromN, toN, calculateRowCount);
                }
                else {
                    this.editRows(data, fromN, toN)
                }
            });
        ws.done(function () {
            console.log("Loading record data success");
        });
        ws.fail(function () {
            alert("An error occurred loading record data");
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
            col.style.fontSize = "100%";
            row.appendChild(col);
        }

        this.table.appendChild(row);
    }

    //Creates cells and rows from the multi-dimensional array data parameter
    createRows(data: string[][], fromN: number, toN: number, calculateRowCount: boolean) {
        for (var i = 0; i < data.length; i++) {
            var row = document.createElement("tr");
            row.className = "row";
            for (var n = 0; n < data[i].length; n++) {
                var col = document.createElement("td");
                var text = data[i][n];
                col.textContent = text;
                col.style.textAlign = "center";
                col.style.fontSize = "100%";
                row.appendChild(col);
            }
            this.table.appendChild(row);

            if (calculateRowCount) {
                this.toN = this.calculateRowCount(row);
                this.loadData((fromN + 1), this.toN, !calculateRowCount, true);
            }
        }
    }

    //Creates cells and rows from the multi-dimensional array data parameter
    editRows(data: string[][], fromN: number, toN: number) {
        for (var i = 0; i < data.length; i++) {
            var row = this.table.childNodes.item(i + 1);
            for (var n = 0; n < data[i].length; n++) {
                var col = row.childNodes.item(n);
                col.textContent = data[i][n];
            }
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
                var diff = this.toN - this.fromN;
                this.fromN -= diff;
                this.toN -= diff;
                this.loadData(this.fromN, this.toN, false, false);
            }
        });

        var next = document.getElementById('next_page');
        next.addEventListener('click', e => {
            var diff = this.toN - this.fromN;
            this.fromN += diff;
            this.toN += diff;
            if (this.toN <= this.recordCount) {
                this.loadData(this.fromN, this.toN, false, false);
            }
            else {
                var diff = this.toN - this.recordCount;
                this.previousTo = diff;
                this.toN = this.recordCount;
                //this.loadRowData(this.fromN, this.toN);
            }
        });
    }

    calculateRowCount(row: HTMLElement): number {
        //screen size
        var screenHeight = this.container.offsetHeight;
        //row size
        var rowHeight = row.offsetHeight + 4;
        //calc table size
        var title = document.getElementById('title');
        var titleHeight = title.offsetHeight;
        var buttonPanel = document.getElementById('button_panel');
        var buttonPanelHeight = buttonPanel.offsetHeight;

        var tableSize = screenHeight - buttonPanelHeight - titleHeight;
        var rowCount = (tableSize / rowHeight);
        var formattedRowCount = +rowCount.toFixed(0);
        return formattedRowCount - 2;
    }
}

window.onload = () => {
    var container = document.getElementById('container');
    var table = <HTMLTableElement>document.getElementById('table');

    var load = new Load(container, table);
    load.loadRecordCount();
    load.loadColumnsHeaders();
    load.loadData(load.fromN, load.toN, true, true);
    load.registerClicks(load, container, table);
    //load.calculateRowCount();
};