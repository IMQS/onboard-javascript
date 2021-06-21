// generate html string for table rows data and render in browser
var RenderTableRows = /** @class */ (function () {
    function RenderTableRows(recordsStr) {
        this.returnStr = "";
        this.arrLength = 0;
        var table = document.querySelector('#table'); // Target div element with ID table
        var navigation = document.querySelector('#navigation'); // Target div element with ID navigation
        var myArr = JSON.parse(recordsStr); // Parse the string to create array of the data
        // Edit styling of the table and navigation bar
        table.style.display = "grid";
        table.style.gridTemplateRows = "repeat(auto-fill, " + (100 / (myArr.length + 2)) + "%)";
        navigation.style.height = (100 / (myArr.length + 2)) + "%";
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
            table.append(div);
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
export { RenderTableRows };
//# sourceMappingURL=render-rows.js.map