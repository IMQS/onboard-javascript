"use strict";
// Class to manage the grid template and display records
var GridTemplate = /** @class */ (function () {
    // Initializes the column names and data records that will be used to display records in the grid.
    function GridTemplate(columnNames, dataRecords) {
        this.columnNames = [];
        this.dataRecords = [];
        this.columnNames = columnNames;
        this.dataRecords = dataRecords;
    }
    ;
    // Display records in a grid in table format 
    GridTemplate.prototype.displayRecords = function () {
        var gridElement = document.getElementById('grid');
        if (gridElement) {
            gridElement.innerHTML = '';
            var table = document.createElement('table');
            var thead = document.createElement('thead');
            var headerRow = document.createElement('tr');
            for (var _i = 0, _a = this.columnNames; _i < _a.length; _i++) {
                var column = _a[_i];
                var th = document.createElement('th');
                th.textContent = column.name;
                headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
            // Create table body
            var tbody = document.createElement('tbody');
            for (var _b = 0, _c = this.dataRecords; _b < _c.length; _b++) {
                var row = _c[_b];
                var tr = document.createElement('tr');
                for (var _d = 0, _e = this.columnNames; _d < _e.length; _d++) {
                    var column = _e[_d];
                    var td = document.createElement('td');
                    td.textContent = row[column.name];
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            // Append the table to the grid element
            gridElement.appendChild(table);
        }
    };
    return GridTemplate;
}());
;
//# sourceMappingURL=GridTemp.js.map