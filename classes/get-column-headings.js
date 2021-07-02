"use strict";
/// <reference path="../interfaces/has-format-method.ts" />
var HFM;
(function (HFM) {
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