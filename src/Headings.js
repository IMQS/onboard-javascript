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
//# sourceMappingURL=Headings.js.map