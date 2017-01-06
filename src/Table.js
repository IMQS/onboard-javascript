var Table = (function () {
    /**
     *
     */
    function Table() {
        this.mainTable = document.getElementById('mainTable');
        this.tableHead = this.mainTable.createTHead();
        this.tableBody = this.mainTable.createTBody();
    }
    Table.prototype.getMainTable = function () {
        return this.mainTable;
    };
    Table.prototype.getHead = function () {
        return this.tableHead;
    };
    Table.prototype.update = function (data, searchedId) {
        var newTableBody = document.createElement('tbody');
        var row;
        for (var i = 0; i < data.length; i++) {
            row = new Row(newTableBody, i);
            if (+data[i][0] == searchedId) {
                row.addRow(data[i], true);
            }
            else {
                row.addRow(data[i], false);
            }
        }
        this.tableBody.parentNode.replaceChild(newTableBody, this.tableBody);
        this.tableBody = newTableBody;
    };
    return Table;
}());
//# sourceMappingURL=Table.js.map