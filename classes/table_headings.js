var tableHeadings = /** @class */ (function () {
    function tableHeadings(headingsStr) {
        this.returnStr = "";
        var myArr = JSON.parse(headingsStr);
        for (var i = 0; i < myArr.length; i++) {
            this.returnStr = this.returnStr + "<th>" + myArr[i] + "</th>";
        }
    }
    tableHeadings.prototype.format = function () {
        return this.returnStr;
    };
    return tableHeadings;
}());
export { tableHeadings };
//# sourceMappingURL=table_headings.js.map