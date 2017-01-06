var Row = (function () {
    function Row(body, index) {
        this.tableBody = body;
        this.index = index;
    }
    /**
     * Creates a row with the given values and inserts it in the
     * table.
     *
     * @param values The contents of the row.
     * @param bold Whether to make the content of the row bold or not.
     */
    Row.prototype.addRow = function (values, bold) {
        var row = this.tableBody.insertRow(this.index);
        var cell;
        for (var i = 0; i < values.length; i++) {
            cell = row.insertCell(i);
            if (bold) {
                cell.innerHTML = "<b>" + values[i] + "</b>";
            }
            else {
                cell.innerHTML = values[i];
            }
        }
    };
    return Row;
}());
//# sourceMappingURL=Row.js.map