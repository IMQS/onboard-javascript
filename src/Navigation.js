var Navigation = (function () {
    function Navigation(newTable) {
        this.headerRowHeight = 23;
        this.bodyMargin = 8;
        this.searchBarHeight = 52;
        this.rowHeight = 24;
        this.table = newTable;
        this.rowNum = 0;
        this.numToFetch = 0;
        this.searchedId = -1;
        this.maxRecords = 0;
    }
    /**
     * Create a bold text node and an input field that will search through the
     * data.
     */
    Navigation.prototype.createSearchField = function () {
        var _this = this;
        var bold = document.createElement('b');
        var title = document.createTextNode("Search ID:");
        bold.appendChild(title);
        this.table.getMainTable().appendChild(bold);
        var searchField = document.createElement("input");
        searchField.id = "search";
        searchField.type = 'number';
        searchField.min = "0";
        searchField.oninput = function () {
            _this.search();
        };
        this.table.getMainTable().appendChild(searchField);
    };
    /**
     * Create buttons for moving through the data one row at a time and
     * add them to the footer.
     */
    Navigation.prototype.createNavigationArrows = function () {
        var _this = this;
        var footer = document.getElementById('mainFooter');
        var downButton = document.createElement('button');
        downButton.onclick = function () {
            _this.moveDown();
        };
        var imgDown = document.createElement('img');
        imgDown.setAttribute('src', "icons/button_down.png");
        downButton.appendChild(imgDown);
        footer.appendChild(downButton);
        var upButton = document.createElement('button');
        upButton.onclick = function () {
            _this.moveUp();
        };
        var imgUp = document.createElement('img');
        imgUp.setAttribute('src', "icons/button_up.png");
        upButton.appendChild(imgUp);
        footer.appendChild(upButton);
    };
    /**
     * Calculates how much data should be fetched from the server based on
     * the height of the web page.
     * The id's from value 'rowNum' until 'numToFetch' is then fetched from
     * the server and the table is then updated.
     */
    Navigation.prototype.update = function () {
        var _this = this;
        this.numToFetch = Math.floor((window.innerHeight - (this.headerRowHeight +
            this.bodyMargin + this.searchBarHeight)) / this.rowHeight) - 1;
        if (this.numToFetch < 0) {
            this.table.update([], this.searchedId);
            return;
        }
        if (this.rowNum < 0) {
            this.rowNum = 0;
        }
        if (this.rowNum + this.numToFetch > this.maxRecords) {
            this.rowNum -= this.rowNum + this.numToFetch - this.maxRecords;
            if (this.rowNum < 0) {
                this.rowNum = 0;
                this.numToFetch = this.maxRecords;
            }
        }
        $.getJSON("http://localhost:2050/records", { from: this.rowNum, to: this.rowNum + this.numToFetch }, function (data) {
            _this.table.update(data, _this.searchedId);
        });
    };
    /**
     * Gets a value from the input field with id 'search' and then adjusts
     * the value 'rowNum' to make the searched row appear as close to the middle
     * of the window as possible.
     */
    Navigation.prototype.search = function () {
        console.log();
        var searchField = document.getElementById('search');
        var value = +searchField.value;
        if (value < 0 || value > this.maxRecords) {
            this.searchedId = -1;
            return;
        }
        this.searchedId = value;
        this.rowNum = value - Math.floor(((window.innerHeight - (this.headerRowHeight +
            this.bodyMargin + this.searchBarHeight)) / this.rowHeight - 1) / 2);
        this.update();
    };
    /**
     * Increments the 'rowNum' value and updates the table.
     */
    Navigation.prototype.moveDown = function () {
        if (this.rowNum + this.numToFetch == this.maxRecords) {
            return;
        }
        this.rowNum++;
        this.update();
    };
    /**
     * Decrements the 'rowNum' value and updates the table.
     */
    Navigation.prototype.moveUp = function () {
        if (this.rowNum == 0) {
            return;
        }
        this.rowNum--;
        this.update();
    };
    Navigation.prototype.setMaxRecords = function (max) {
        this.maxRecords = max;
    };
    return Navigation;
}());
//# sourceMappingURL=Navigation.js.map