/// <reference path="third_party/jquery.d.ts" />
var page;
(function (page) {
    var data; // Instance of CData class that retrieves and stores server data
    var grid; // Instance of CGrid class that creates and updates the grid DOM
    function Start() {
        // Class instantiation
        // Data containter class
        data = new CData();
        //Pass the id of the DOM element manipulated by the class
        grid = new CGrid("grid-view");
        $(document).ready(function () {
            // Fetch required information first, record count and record length
            $.when(data.getRecordCount('/recordCount', data.setRecordCount.bind(data)), data.getColumnNames('/columns', data.setColumnNames.bind(data))).done(function () {
                // Initialise the elements for the navigation class
                grid["nav"]["baseRows"] = grid.getRowCount();
                grid["nav"]["cntRow"] = grid["nav"]["baseRows"];
                grid["nav"]["cntLen"] = grid["nav"]["baseRows"];
                grid["nav"]["cntMax"] = data.recordCount;
                grid["nav"]["idxPage"] = 0;
                // Navigate to the first page of data
                grid["nav"].first();
                move();
                /**
                 * Only register the on click handlers of the buttons after necessary data has
                 * been retrieved from server
                 *
                 * First button on click event handler
                 */
                $("#grid-first").click(function () {
                    grid["nav"].first();
                    move();
                });
                //Previous button on click event handler
                $("#grid-prev").click(function () {
                    grid["nav"].prev();
                    move();
                });
                //Next button on click event handler
                $("#grid-next").click(function () {
                    grid["nav"].next();
                    move();
                });
                //Last button on click event handler
                $("#grid-last").click(function () {
                    grid["nav"].last();
                    move();
                });
                //Register Search button on click event handler
                $("#grid-search").click(onSearch);
            });
        });
    }
    page.Start = Start;
    ;
    /**
     * Update the table/grid to reflect the page of data requested.
     * The update to the DOM is only performed after retrieving the records from the server
     */
    function move() {
        $.when(data.getRecords('/records', grid["nav"]["idxPage"], (grid["nav"]["cntLen"]), data.setRecords.bind(data))).done(function () {
            grid.update(data);
        });
    }
    ;
    //Utilise the SEARCH functionality on the data set
    function onSearch() {
        //Verify text against being empty and to consist only of numbers
        var text = $('#grid-text').val();
        if ((!text) || (/[a-zA-Z]/.test(text))) {
            alert('Search string either empty or contains alphabetic letter(s).\nPlease type the requested record number.');
        }
        else {
            //Parse input string to number
            var searchId = parseInt(text);
            if (!searchId) {
            }
            else {
                grid["nav"]["idxSearch"] = searchId;
                grid["nav"].search();
                // Update the DOM
                move();
                /**
                 * Corrects the page index to the start value of the next page
                 * seeing that record retrieval for the next page has to start there.
                 * This corrects page's pointer to available data on the server, but does
                 * not update the DOM
                 */
                grid["nav"].next();
            }
        }
    }
    ;
    var CValid = (function () {
        function CValid(init) {
            this.state = true; // Member used to validate conditions against
            if (init) {
                /**
                 * Set the initial state if parameter is passed into constructor,
                 * otherwise the default assigned state is used
                 */
                this.state = init;
            }
        }
        /**
         * Evaluates a condition to the current overall
         * state of validation for particular instance
         */
        CValid.prototype.condition = function (state) {
            this.state = this.state && (state);
            return this.state;
        };
        // Retrieves the current overall validation state
        CValid.prototype.getState = function () {
            return this.state;
        };
        return CValid;
    })();
    var CData = (function () {
        function CData() {
            this.recordCount = 0; // Number of records available on the server
            this.valid = new CValid(); // Instantiate validation class with default start state
            this.recordData = []; // Instantiate member
        }
        /**
         * Callback for asynchronuous request to server for /recordCount
         * Set the apropriate class member
         */
        CData.prototype.setRecordCount = function (count, state) {
            if (!this.valid.condition(state)) {
                alert("ERROR: Invalid data from server.\nPlease reload page.");
            }
            else {
                this.recordCount = count;
            }
        };
        ;
        /**
         * Asyncronuous request to server for /recordCount
         */
        CData.prototype.getRecordCount = function (url, fn) {
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (data) {
                    fn(data, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /recordCount from server.");
                }
            });
        };
        ;
        /**
         * Callback for asynchronuous request to server for /columns
         * Set the apropriate class member
         */
        CData.prototype.setColumnNames = function (names, state) {
            if (!this.valid.condition(state)) {
                alert("ERROR: Invalid data from server.\nPlease reload page.");
            }
            else {
                // Member explicitly intialised (and flushed), no verification of state required
                this.columnNames = [];
                $.each(names, function (key, value) {
                    this.columnNames[key] = value;
                }.bind(this));
            }
        };
        ;
        /**
         * Asyncronuous request to server for /columns
         */
        CData.prototype.getColumnNames = function (url, fn) {
            var names;
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (columns) {
                    fn(columns, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /columns from server.");
                }
            });
        };
        ;
        /**
         * Callback for asynchronuous request to server for /records
         * Set the apropriate class member
         */
        CData.prototype.setRecords = function (records, state) {
            if (!this.valid.condition(state)) {
                alert("ERROR: Invalid data from server.\nPlease reload page.");
            }
            else {
                // Member explicitly intialised (and flushed), no verification of state required
                this.recordData = [];
                $.each(records, function (key, value) {
                    this.recordData[key] = value;
                }.bind(this));
            }
        };
        ;
        /**
         * Asyncronuous request to server for /records
         */
        CData.prototype.getRecords = function (url, idxStart, Len, fn) {
            url = url.concat("?from=" + idxStart.toString() + "&to=" + (parseInt(((idxStart + Len - 1).toString()))).toString());
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (records) {
                    fn(records, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /records from server.");
                }
            });
        };
        ;
        return CData;
    })();
    var CNav = (function () {
        function CNav() {
            this.idxSearch = 0; // Search literal from input
            this.idxPage = 0; // Current record start index for page
            this.cntRow = 0; // Number of rows to populate for page
            this.baseRows = 0; // Fixed number of rows that the DOM can fit into available space
            this.cntMax = 0; // Maximum number of records available as per server request
            this.cntLen = 0; // Length of page data request
        }
        /**
         * Logic to move the index of data pointed to when requesting to see the FIRST page
         * Absolute location at the start of data
         */
        CNav.prototype.first = function () {
            this.idxPage = 0;
            this.cntRow = this.baseRows;
            this.cntLen = this.cntRow;
        };
        ;
        /**
         * Logic to move the index of data pointed to when requesting to see the NEXT page
         * Relative to the current location
         */
        CNav.prototype.next = function () {
            var idx = (this.idxPage + this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = idx;
                this.cntRow = this.baseRows;
                this.cntLen = this.cntRow;
            }
            else {
                this.cntLen = ((this.cntMax - this.idxPage));
                this.cntRow = this.cntLen;
            }
        };
        ;
        /**
         * Logic to move the index of data pointed to when requesting to see the PREVIOUS page
         * Relative to the current location
         */
        CNav.prototype.prev = function () {
            var idx = (this.idxPage - this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = idx;
                this.cntRow = this.baseRows;
            }
            else {
                this.idxPage = 0;
                this.cntRow = this.baseRows;
            }
            this.cntLen = this.cntRow;
        };
        ;
        /**
         * Logic to move the index of data pointed to when requesting to see the LAST page
         * Absolute location at the end of data, showing the entire last page of data
         */
        CNav.prototype.last = function () {
            this.idxPage = ((this.cntMax - this.baseRows));
            this.cntRow = this.baseRows;
            this.cntLen = this.cntRow;
        };
        ;
        /**
         * Logic to move the index of data pointed to when requesting aparticular record via SEARCH
         * Absolute location with the record index at the start of the table
         */
        CNav.prototype.search = function () {
            var idx = (this.idxSearch + this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = this.idxSearch;
                this.cntRow = this.baseRows;
                this.cntLen = this.cntRow;
            }
            else {
                this.idxPage = this.idxSearch;
                this.cntLen = ((this.cntMax - this.idxPage));
                this.cntRow = this.cntLen;
            }
        };
        ;
        return CNav;
    })();
    /**
     * Used to implement the three different methods of building the table
     * Performed a small performance evaluation on the three methods
     */
    var eCreateType;
    (function (eCreateType) {
        eCreateType[eCreateType["ELEMENTS"] = 0] = "ELEMENTS";
        eCreateType[eCreateType["JQUERY"] = 1] = "JQUERY";
        eCreateType[eCreateType["STRING"] = 2] = "STRING";
    })(eCreateType || (eCreateType = {}));
    ;
    var CGrid = (function () {
        function CGrid(id) {
            this.nav = new CNav();
            this.rowHeight = 20; // Default row height for number of row calculations
            this.hdrHeight = 20; // Default header height for number of row calculations
            this.eCreate = eCreateType.STRING; // Default method of DOM creation
            this.id = id;
        }
        /**
         * Removes the current, re-creates and updates the DOM elements of the table
         * with the latest page data
         */
        CGrid.prototype.update = function (data) {
            if (!data.valid.getState()) {
                alert("ERROR: Corrupt data set.\nPlease reload page.");
            }
            else {
                $("#" + this.id).children().remove();
                this.create(data.columnNames.length, true, data.columnNames);
                for (var idxData = 0; idxData < (this["nav"]["cntRow"]); idxData++) {
                    this.create(data.columnNames.length, false, data.recordData[idxData]);
                }
            }
        };
        ;
        CGrid.prototype.getRowCount = function () {
            /**
             * This calculation excludes the header row since the header can be of different dimensions
             * Subtract a few rows to ensure the scroll bar is not visible at all times (eliminate the tolerance)
             * clientWidth and clientHeight does not include the scrollbar dimensions and is thus used.
             */
            return (parseInt(((((document.documentElement.clientHeight) - (document.documentElement.offsetHeight + this.getHdrHeight())) / this.getRowHeight())).toString()) - 2);
        };
        ;
        CGrid.prototype.getHdrHeight = function () {
            // Create phantom DOM object
            var $el = $("<th></th>").hide().appendTo("body");
            // Read CSS style sheet properties
            var height = parseInt($el.css("height"));
            this.hdrHeight = height;
            return this.hdrHeight;
        };
        ;
        CGrid.prototype.getRowHeight = function () {
            // Create phantom DOM object
            var $el = $("<td></td>").hide().appendTo("body");
            // Read CSS style sheet properties
            var height = parseInt($el.css("height"));
            this.rowHeight = height;
            return this.rowHeight;
        };
        ;
        /**
         * Only one of the three methods is used.
         * Left all three methods in the code for comparing performmance and as a
         * future reference to self
         */
        CGrid.prototype.create = function (cntCol, fHdr, rowData) {
            var start = new Date().getTime();
            switch (this.eCreate) {
                case eCreateType.ELEMENTS:
                    {
                        // Implement using HTML elements
                        var rowElement = document.createElement("tr");
                        for (var idxCol = 0; idxCol < cntCol; idxCol++) {
                            rowElement.appendChild(document.createElement((fHdr) ? "th" : "td")).textContent = rowData[idxCol];
                        }
                        document.getElementById(this.id).appendChild(rowElement);
                        break;
                    }
                case eCreateType.JQUERY:
                    {
                        // Implement using JQuery components
                        var jrow = $("<tr />");
                        for (var idxCol = 0; idxCol < cntCol; idxCol++) {
                            jrow.append($((fHdr) ? "<th />" : "<td />").text(rowData[idxCol]));
                        }
                        $("#" + this.id).append(jrow);
                        break;
                    }
                case eCreateType.STRING:
                    {
                        // Build a static string that describes the HTML
                        var row;
                        row += "<tr>";
                        if (!rowData) {
                        }
                        else {
                            for (var idxCol = 0; idxCol < cntCol; idxCol++) {
                                row += (fHdr) ? "<th>" : "<td>";
                                row += rowData[idxCol];
                                row += (fHdr) ? "</th>" : "</td>";
                            }
                            row += "</tr>";
                            $("#" + this.id).append(row);
                        }
                        break;
                    }
                default:
                    {
                        alert("ERROR: Grid not created.\n Please reload page");
                    }
            }
            // Only for performance considerations
            var time = (new Date().getTime() - start);
        };
        return CGrid;
    })();
})(page || (page = {}));
window.onload = function () {
    page.Start();
};
//# sourceMappingURL=app.js.map