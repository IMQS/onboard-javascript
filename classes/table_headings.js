// generate html string for table headings data
var TableHeadingString = /** @class */ (function () {
    function TableHeadingString(headingsStr) {
        this.returnStr = "";
        this.arrLength = 0;
        var myArr = JSON.parse(headingsStr);
        this.arrLength = myArr.length;
        for (var i = 0; i < myArr.length; i++) {
            this.returnStr +=
                "<div><p><b>" + myArr[i] + "</b></p></div>";
        }
    }
    TableHeadingString.prototype.arrayLength = function () {
        return this.arrLength;
    };
    TableHeadingString.prototype.internalFormat = function () {
        return this.returnStr;
    };
    return TableHeadingString;
}());
export { TableHeadingString };
//# sourceMappingURL=table_headings.js.map