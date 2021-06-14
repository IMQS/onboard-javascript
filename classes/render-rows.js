// generate html string for table rows data and render in browser
var RenderTableRows = /** @class */ (function () {
    function RenderTableRows(recordsStr) {
        this.returnStr = "";
        this.arrLength = 0;
        var table = document.querySelector('#table');
        var myArr = JSON.parse(recordsStr);
        for (var i = 0; i < myArr.length; i++) {
            for (var j = 0; j < myArr[i].length; j++) {
                this.arrLength = myArr[i].length;
                this.returnStr +=
                    "<div><p>" + myArr[i][j] + "</p></div>";
            }
            var div = document.createElement('div');
            div.innerHTML = this.returnStr;
            div.className = "tablecell";
            div.style.gridTemplateColumns = "repeat(" + this.arrLength + ", 1fr)";
            table.append(div);
            this.returnStr = "";
        }
    }
    RenderTableRows.prototype.arrayLength = function () {
        return this.arrLength;
    };
    RenderTableRows.prototype.internalFormat = function () {
        return this.returnStr;
    };
    return RenderTableRows;
}());
export { RenderTableRows };
//# sourceMappingURL=render-rows.js.map