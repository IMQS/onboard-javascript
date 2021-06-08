// generate html string for table headings data
var TableHeadingString = /** @class */ (function () {
    function TableHeadingString(headingsStr) {
        this.returnStr = "";
        var myArr = JSON.parse(headingsStr);
        for (var i = 0; i < myArr.length; i++) {
            this.returnStr +=
                "<th>" + myArr[i] + "</th>";
        }
    }
    TableHeadingString.prototype.internalFormat = function () {
        return this.returnStr;
    };
    return TableHeadingString;
}());
export { TableHeadingString };
//# sourceMappingURL=table_headings.js.map