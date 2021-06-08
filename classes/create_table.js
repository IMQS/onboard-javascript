var createTable = /** @class */ (function () {
    function createTable(container) {
        this.container = container;
    }
    createTable.prototype.constructTableHeadings = function (element) {
        var tr = document.createElement('tr');
        tr.innerHTML = element.format();
        this.container.append(tr);
    };
    return createTable;
}());
export { createTable };
//# sourceMappingURL=create_table.js.map