var recordStruct = /** @class */ (function () {
    function recordStruct(recordsStr) {
        this.returnStr = "";
        var table = document.querySelector('table');
        var myArr = JSON.parse(recordsStr);
        for (var i = 0; i < myArr.length; i++) {
            for (var j = 0; j < myArr[i].length; j++) {
                this.returnStr = this.returnStr + "<td>" + myArr[i][j] + "</td>";
            }
            var tr = document.createElement('tr');
            tr.innerHTML = this.returnStr;
            table.append(tr);
            this.returnStr = "";
        }
    }
    recordStruct.prototype.format = function () {
        return this.returnStr;
    };
    return recordStruct;
}());
export { recordStruct };
//# sourceMappingURL=record_struct.js.map