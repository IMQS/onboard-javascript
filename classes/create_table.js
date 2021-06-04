var createTable = /** @class */ (function () {
    function createTable(container) {
        this.container = container;
    }
    createTable.prototype.renderHeading = function (headings) {
        var th = document.createElement('th');
        th.innerHTML = headings.format();
        this.container.append(th);
    };
    createTable.prototype.renderRecords = function (records) {
        var tr = document.createElement('tr');
        tr.innerHTML = records.format();
        this.container.append(tr);
    };
    return createTable;
}());
export { createTable };
//# sourceMappingURL=create_table.js.map