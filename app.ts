
class TableControl {
    table: HTMLElement;
    cursor: number;
    cellHeight: string;
    displayableRows: number;
    rows: number;
    columns : Object;
    records: Object;

    constructor(cellHeight: string) {
        this.cellHeight = cellHeight;
        this.displayableRows = 1;
        this.cursor = 0;
        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    }

    setTable(table: HTMLElement) {
        this.table = table;
    }

    getRowsDisplayable() {
        var size = window.innerHeight - this.table.offsetTop-2;
        this.displayableRows= Math.floor(size / (parseInt(this.cellHeight)+6));
    }

    httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    getLength(obj: any){
        return (<Array<any>>obj).length;
    }

    removeChildren(node: any) {
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
    }

    nextPage() {
        if (this.cursor + this.displayableRows-1 < this.rows)
            this.cursor += this.displayableRows - 1;
        else
            this.cursor = this.rows - 1;
    }
    
    previousPage() {
        if (this.cursor - this.displayableRows - 1 >= 0)
            this.cursor -= this.displayableRows - 1;
        else
            this.cursor = 0;
    }

    setCursor(cursor: number) {
        if (cursor >= 0 && cursor < this.rows) {
            this.cursor = cursor;
            return 0;
        }
        return -1;
    }

    setMessage(message:string) {
        this.removeChildren(this.table);
        this.table.innerHTML = message;
    }

    showPage() {
        this.removeChildren(this.table);

        var rowQuery = this.httpGet('/recordCount');
        try {
            this.rows = Number(jQuery.parseJSON(rowQuery));
        }
        catch (err) {
            this.setMessage("Invalid return from /recordCount: " + rowQuery);
            return;
        }

        var columnQuery = this.httpGet('/columns');
        try {
            this.columns = jQuery.parseJSON(columnQuery);
        }
        catch (err) {
            this.setMessage("Invalid return from /columns: " + columnQuery);
            return;
        }  

        var to = (this.cursor + this.displayableRows - 2);
        if (to > this.rows)
            to = this.rows;

        var recordQuery = this.httpGet("/records?from=" + (this.cursor) + "&to=" + (to));
        try {
            this.records = jQuery.parseJSON(recordQuery);
        }
        catch (err) {
            this.setMessage("Invalid return from /records?from=" + (this.cursor) + "&to=" + (to) + " : " + recordQuery);
            return;
        } 

        this.table.style.textAlign = "center";

        for (var row = this.getLength(this.records)-1; row >= 0; row--) {
            let newRow: HTMLElement = (<HTMLTableElement>this.table).insertRow(0);
            var cols = this.getLength(this.records[row])
            for (var col = cols - 1; col >= 0; col--) {
                let newCell: HTMLElement = (<HTMLTableRowElement>newRow).insertCell(0);
                newCell.style.width = (100 / cols).toString() + "%";
                newCell.style.height = this.cellHeight;
                var newText = document.createTextNode(this.records[row][col]);
                newCell.appendChild(newText);
            }
        }

        let headerRow: HTMLElement = (<HTMLTableElement>this.table).insertRow(0);
        for (var col = this.getLength(this.columns) - 1; col >= 0; col--) {
            let newCell: HTMLElement = (<HTMLTableRowElement>headerRow).insertCell(0);
            newCell.style.width = (100 / cols).toString() + "%";
            newCell.style.height = this.cellHeight;
            var newText = document.createTextNode(this.columns[col]);
            newCell.appendChild(newText);
        }
    }
}

var control = new TableControl("30px");

window.onload = () => {
    var table = document.getElementById('table');
    control.setTable(table);

    var test = document.getElementById('Testinglabel');
    control.getRowsDisplayable();
    control.showPage();
    
    var nextBtn = <HTMLButtonElement>document.getElementById("next");
    var previous = <HTMLButtonElement>document.getElementById("previous");
    var idInput = <HTMLInputElement>document.getElementById("idInput");
    
    nextBtn.onclick = function () {
        control.nextPage();
        control.showPage();
        test.textContent = "" + control.cursor;
    };
    previous.onclick = function () {
        control.previousPage();
        control.showPage();
        test.textContent = "" + control.cursor;
    };
    idInput.onchange = function () {
        if (control.setCursor(parseInt(idInput.value))) {
            idInput.style.background = "red";
        }
        else
            idInput.style.background = "white";
        control.showPage();
        test.textContent = "" + control.cursor;
    };
};

window.onresize = () => {
    control.getRowsDisplayable();
    control.showPage();
};