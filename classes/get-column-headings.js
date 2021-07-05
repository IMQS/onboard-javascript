"use strict";
/// <reference path="../interfaces/has-format-method.ts" />
var HFM;
(function (HFM) {
    /**
       * This function is used to fetch the column headings from the back-end
       * @param hd This parameter holds the HTML DIV element with ID #headings
       * @param interfaceHeading This parameter is of type interface and holds the method for rendering the headings to the HTML DOM
       * @method HFM.TableHeadingString This method is for rendering the headings to the HTML DOM
    */
    function getColumnsHeadings() {
        fetch("/columns").then(function (res) { return res.text(); }).then(function (headingsStr) {
            var hd = new HFM.RenderTableHeading(document.querySelector('#headings'));
            var interfaceHeading = new HFM.TableHeadingString(headingsStr);
            hd.constructTableHeadings(interfaceHeading);
        }).catch(function (err) { return console.log(err); });
    }
    HFM.getColumnsHeadings = getColumnsHeadings;
})(HFM || (HFM = {}));
//# sourceMappingURL=get-column-headings.js.map