"use strict";
/// <reference path="../interfaces/has-format-method.ts" />
var HFM;
(function (HFM) {
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
    HFM.TableHeadingString = TableHeadingString;
})(HFM || (HFM = {}));
//# sourceMappingURL=table-heading-string.js.map