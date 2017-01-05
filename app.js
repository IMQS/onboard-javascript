/// <reference path="./third_party/jquery.d.ts" />
var rowNum = 0;
var table;
var timeout = 0;
var Table = (function () {
    function Table() {
        this.table = document.getElementById("mainTable");
        this.tableHead = this.table.createTHead();
        this.tableBody = this.table.createTBody();
    }
    Table.prototype.getHead = function () {
        return this.tableHead;
    };
    Table.prototype.update = function (data) {
        var newTableBody = document.createElement('tbody');
        var row;
        for (var i = 0; i < data.length; i++) {
            row = new Row(newTableBody, rowNum + i);
            row.addRow(data[i]);
        }
        this.tableBody.parentNode.replaceChild(newTableBody, this.tableBody);
        this.tableBody = newTableBody;
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
            cell.innerHTML = "<b>" + headings[i] + "</b>";
        }
    };
    return Headings;
}());
window.onload = function () {
    table = new Table();
    var tableHead = new Headings(table.getHead());
    $.getJSON("http://localhost:2050/columns", function (data) {
        tableHead.makeColumnHeadings(data);
    });
    $(window).resize(function () {
        clearTimeout(timeout);
        timeout = setTimeout(resize, 250);
    });
    $(window).resize();
};
function resize() {
    var NumToFetch = 0;
    NumToFetch = Math.floor((window.innerHeight - 41) / 24) - 1;
    if (NumToFetch < 0) {
        table.update([]);
        return;
    }
    $.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch }, function (data) {
        table.update(data);
    });
}
//# sourceMappingURL=app.js.map