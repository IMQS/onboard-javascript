"use strict";
/// <reference path="../has-format-method.ts" />
var HasFormatMethod;
(function (HasFormatMethod) {
    var RenderTableHeading = /** @class */ (function () {
        function RenderTableHeading(container) {
            this.container = container;
        }
        RenderTableHeading.prototype.constructTableHeadings = function (hd) {
            var div = document.createElement('div');
            div.innerHTML = hd.internalFormat();
            div.className = "tablecell";
            div.style.gridTemplateColumns = "repeat(" + hd.arrayLength() + ", 1fr)";
            this.container.append(div);
        };
        return RenderTableHeading;
    }());
    HasFormatMethod.RenderTableHeading = RenderTableHeading;
    var TableHeadingString = /** @class */ (function () {
        function TableHeadingString(headingsStr) {
            this.returnStr = "";
            this.arrLength = 0;
            var myArr = JSON.parse(headingsStr);
            this.arrLength = myArr.length;
            // Create innerHTML text to be rendered to front-end in the table div
            for (var i = 0; i < myArr.length; i++) {
                this.returnStr +=
                    "<div><p><b>" + myArr[i] + "</b></p></div>";
            }
        }
        // Returns length of array of headings to get number of columns necessary to render
        TableHeadingString.prototype.arrayLength = function () {
            return this.arrLength;
        };
        // Returns formatted string to be placed in html
        TableHeadingString.prototype.internalFormat = function () {
            return this.returnStr;
        };
        return TableHeadingString;
    }());
    HasFormatMethod.TableHeadingString = TableHeadingString;
})(HasFormatMethod || (HasFormatMethod = {}));
//# sourceMappingURL=table-headings.js.map