/// <reference path="./third_party/jquery.d.ts" />
var rowNum = 0;
var table;
var timeout = 0;
var maxRecords = 0;
var NumToFetch = 0;
var searchedId = -1;
var Table = (function () {
    function Table() {
        this.table = document.getElementById('mainTable');
        this.tableHead = this.table.createTHead();
        this.tableBody = this.table.createTBody();
        var bold = document.createElement('b');
        var title = document.createTextNode("Search ID:");
        bold.appendChild(title);
        this.table.appendChild(bold);
        var searchField = document.createElement("input");
        searchField.id = "search";
        searchField.type = 'number';
        searchField.min = "0";
        searchField.oninput = search;
        this.table.appendChild(searchField);
    }
    Table.prototype.getHead = function () {
        return this.tableHead;
    };
    Table.prototype.update = function (data) {
        var newTableBody = document.createElement('tbody');
        var row;
        for (var i = 0; i < data.length; i++) {
            row = new Row(newTableBody, i);
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
            if (values[0] == searchedId) {
                cell.innerHTML = "<b>" + values[i] + "</b>";
            }
            else {
                cell.innerHTML = values[i];
            }
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
    $.get("http://localhost:2050/recordCount", function (data) {
        maxRecords = data - 1;
        $(window).resize();
    });
    $.getJSON("http://localhost:2050/columns", function (data) {
        tableHead.makeColumnHeadings(data);
    });
    $(window).resize(function () {
        clearTimeout(timeout);
        timeout = setTimeout(resize, 250);
    });
    createNavigation();
};
function createNavigation() {
    var footer = document.getElementById('mainFooter');
    var downButton = document.createElement('button');
    var upButton = document.createElement('button');
    var imgDown = document.createElement('img');
    var imgUp = document.createElement('img');
    imgDown.setAttribute('src', "icons/button_down.png");
    imgUp.setAttribute('src', "icons/button_up.png");
    downButton.appendChild(imgDown);
    upButton.appendChild(imgUp);
    downButton.onclick = moveDown;
    upButton.onclick = moveUp;
    footer.appendChild(downButton);
    footer.appendChild(upButton);
}
function resize() {
    NumToFetch = Math.floor((window.innerHeight - (41 + 42)) / 24) - 1;
    if (NumToFetch < 0) {
        table.update([]);
        return;
    }
    if (rowNum < 0) {
        rowNum = 0;
    }
    if (rowNum + NumToFetch > maxRecords) {
        rowNum -= rowNum + NumToFetch - maxRecords;
        if (rowNum < 0) {
            rowNum = 0;
            NumToFetch = maxRecords;
        }
    }
    $.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch }, function (data) {
        table.update(data);
    });
}
function search() {
    var searchField = document.getElementById('search');
    var value = +searchField.value;
    if (value < 0 || value > maxRecords) {
        return;
    }
    searchedId = value;
    rowNum = value - Math.floor(((window.innerHeight - (41 + 40)) / 24 - 1) / 2);
    resize();
}
function moveDown() {
    if (rowNum + NumToFetch == maxRecords) {
        return;
    }
    rowNum++;
    resize();
}
function moveUp() {
    if (rowNum == 0) {
        return;
    }
    rowNum--;
    resize();
}
//# sourceMappingURL=app.js.map