var TableControl = (function () {
    function TableControl(cellHeight) {
        this.cellHeight = cellHeight;
        this.displayableRows = 1;
        this.cursor = 0;
        document.documentElement.style.overflow = 'hidden'; // firefox, chrome
    }
    TableControl.prototype.setTable = function (table) {
        this.table = table;
    };
    TableControl.prototype.getRowsDisplayable = function () {
        var size = window.innerHeight - this.table.offsetTop - 2;
        this.displayableRows = Math.floor(size / (parseInt(this.cellHeight) + 6));
    };
    TableControl.prototype.httpGet = function (theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    };
    TableControl.prototype.getLength = function (obj) {
        return obj.length;
    };
    TableControl.prototype.removeChildren = function (node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
    };
    TableControl.prototype.nextPage = function () {
        if (this.cursor + this.displayableRows - 1 < this.rows)
            this.cursor += this.displayableRows - 1;
        else
            this.cursor = this.rows - 1;
    };
    TableControl.prototype.previousPage = function () {
        if (this.cursor - this.displayableRows - 1 >= 0)
            this.cursor -= this.displayableRows - 1;
        else
            this.cursor = 0;
    };
    TableControl.prototype.setCursor = function (cursor) {
        if (cursor >= 0 && cursor < this.rows) {
            this.cursor = cursor;
            return 0;
        }
        return -1;
    };
    TableControl.prototype.setMessage = function (message) {
        this.removeChildren(this.table);
        this.table.innerHTML = message;
    };
    TableControl.prototype.showPage = function () {
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
        for (var row = this.getLength(this.records) - 1; row >= 0; row--) {
            var newRow = this.table.insertRow(0);
            var cols = this.getLength(this.records[row]);
            for (var col = cols - 1; col >= 0; col--) {
                var newCell = newRow.insertCell(0);
                newCell.style.width = (100 / cols).toString() + "%";
                newCell.style.height = this.cellHeight;
                var newText = document.createTextNode(this.records[row][col]);
                newCell.appendChild(newText);
            }
        }
        var headerRow = this.table.insertRow(0);
        for (var col = this.getLength(this.columns) - 1; col >= 0; col--) {
            var newCell = headerRow.insertCell(0);
            newCell.style.width = (100 / cols).toString() + "%";
            newCell.style.height = this.cellHeight;
            var newText = document.createTextNode(this.columns[col]);
            newCell.appendChild(newText);
        }
    };
    return TableControl;
})();
var control = new TableControl("30px");
window.onload = function () {
    var table = document.getElementById('table');
    control.setTable(table);
    var test = document.getElementById('Testinglabel');
    control.getRowsDisplayable();
    control.showPage();
    var nextBtn = document.getElementById("next");
    var previous = document.getElementById("previous");
    var idInput = document.getElementById("idInput");
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
window.onresize = function () {
    control.getRowsDisplayable();
    control.showPage();
};
//# sourceMappingURL=app.js.map