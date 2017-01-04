/// <reference path="./third_party/jquery.d.ts" />
var rowNum = 0;
var table;
var Table = (function () {
    function Table() {
        var table = document.getElementById("mainTable");
        this.tableHead = table.createTHead();
        this.tableBody = table.createTBody();
    }
    Table.prototype.getHead = function () {
        return this.tableHead;
    };
    Table.prototype.getBody = function () {
        return this.getBody;
    };
    Table.prototype.update = function (data) {
        var row;
        for (var i = 0; i < data.length; i++) {
            row = new Row(this.tableBody, rowNum + i);
            row.addRow(data[i]);
        }
    };
    return Table;
}());
var Row = (function () {
    function Row(body, index) {
        this.tableBody = body;
        this.index = index;
    }
    Row.prototype.addRow = function (values) {
        if (values === void 0) { values = []; }
        var row = this.tableBody.insertRow(this.index);
        var cell;
        for (var i = 0; i < values.length; i++) {
            cell = row.insertCell(i);
            cell.innerHTML = values[i];
        }
    };
    return Row;
}());
var Headings = (function () {
    function Headings(head) {
        this.tableHead = head;
    }
    Headings.prototype.makeColumnHeadings = function (headings) {
        var row = this.tableHead.insertRow(0);
        var cell;
        for (var i = 0; i < headings.length; i++) {
            cell = row.insertCell(i);
            cell.innerHTML = "<b>" + headings[i] + "<b>";
        }
    };
    return Headings;
}());
window.onload = function () {
    table = new Table();
    var tableHead = new Headings(table.getHead());
    var NumToFetch = 0;
    NumToFetch = Math.floor(window.innerHeight / 25) - 1;
    $.getJSON("http://localhost:2050/columns", function (data) {
        tableHead.makeColumnHeadings(data);
    });
    $.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch }, function (data) {
        table.update(data);
    });
};
window.onresize = function (event) {
};
//# sourceMappingURL=app.js.map