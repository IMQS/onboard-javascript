"use strict";
/// <reference path="../interfaces/has-format-method.ts" />
var HFM;
(function (HFM) {
    /**
       * This class is used to create the html string containing the column headings of the grid
       * @param returnStr This parameter holds formatted html string containing the column headings to be injected into the DOM
       * @param arrLength This parameter holds length of the array containing the column headings
       * @param myArr This parameter is the array of the parsed string of headings fetched from the back-end
       * @function arrayLength This function returns the length of the array of headings to be rendered
       * @function internalFormat This function returns the formatted html string containing all the column headings
    */
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