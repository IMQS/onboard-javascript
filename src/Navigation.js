var Navigation = (function () {
    function Navigation(newTable) {
        this.table = newTable;
        this.rowNum = 0;
        this.NumToFetch = 0;
        this.searchedId = -1;
        this.maxRecords = 0;
    }
    /**
     * Create a bold textnode and an input field that will search through the
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
     * Create buttons for moving throught the data one row at a time and
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
    Navigation.prototype.update = function () {
        var _this = this;
        this.NumToFetch = Math.floor((window.innerHeight - (41 + 42)) / 24) - 1;
        if (this.NumToFetch < 0) {
            this.table.update([], this.searchedId);
            return;
        }
        if (this.rowNum < 0) {
            this.rowNum = 0;
        }
        if (this.rowNum + this.NumToFetch > this.maxRecords) {
            this.rowNum -= this.rowNum + this.NumToFetch - this.maxRecords;
            if (this.rowNum < 0) {
                this.rowNum = 0;
                this.NumToFetch = this.maxRecords;
            }
        }
        $.getJSON("http://localhost:2050/records", { from: this.rowNum, to: this.rowNum + this.NumToFetch }, function (data) {
            _this.table.update(data, _this.searchedId);
        });
    };
    Navigation.prototype.search = function () {
        console.log();
        var searchField = document.getElementById('search');
        var value = +searchField.value;
        if (value < 0 || value > this.maxRecords) {
            this.searchedId = -1;
            return;
        }
        this.searchedId = value;
        this.rowNum = value - Math.floor(((window.innerHeight - (41 + 42)) / 24 - 1) / 2);
        this.update();
    };
    Navigation.prototype.moveDown = function () {
        if (this.rowNum + this.NumToFetch == this.maxRecords) {
            return;
        }
        this.rowNum++;
        this.update();
    };
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
    Navigation.prototype.getRowNum = function () {
        return this.rowNum;
    };
    return Navigation;
}());
//# sourceMappingURL=Navigation.js.map