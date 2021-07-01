"use strict";
/// <reference path="../has-format-method.ts" />
var HFM;
(function (HFM) {
    var RenderTableRows = /** @class */ (function () {
        function RenderTableRows(recordsStr) {
            this.returnStr = "";
            this.arrLength = 0;
            var records = document.querySelector('#records');
            var navigation = document.querySelector('#navigation');
            var myArr = JSON.parse(recordsStr);
            // Edit styling of the table and navigation bar
            records.style.display = "grid";
            records.style.gridTemplateRows = "repeat(auto-fill, " + (100 / (myArr.length + 2)) + "%)";
            records.style.height = "100%";
            navigation.style.height = (100 / (myArr.length + 2)) + "%";
            var headings = document.querySelector('#headings');
            headings.style.height = 100 / (myArr.length + 2) + "%";
            // Create innerHTML text to be rendered to front-end in the table div
            for (var i = 0; i < myArr.length; i++) {
                for (var j = 0; j < myArr[i].length; j++) {
                    this.arrLength = myArr[i].length;
                    this.returnStr +=
                        "<div><p>" + myArr[i][j] + "</p></div>";
                }
                // Append innerHTML text to div element in front-end
                var div = document.createElement('div');
                div.innerHTML = this.returnStr;
                div.className = "tablecell";
                div.style.gridTemplateColumns = "repeat(" + this.arrLength + ", 1fr)";
                records.append(div);
                this.returnStr = "";
            }
        }
        // Returns length of array of headings to get number of columns necessary to render
        RenderTableRows.prototype.arrayLength = function () {
            return this.arrLength;
        };
        // Returns formatted string to be placed in html
        RenderTableRows.prototype.internalFormat = function () {
            return this.returnStr;
        };
        return RenderTableRows;
    }());
    HFM.RenderTableRows = RenderTableRows;
})(HFM || (HFM = {}));
//# sourceMappingURL=render-table-rows.js.map