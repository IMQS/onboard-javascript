/* Grid object class
 *   this contains the entire grid object and methods to retrieve data from server
 *   and parse data to html strings for displaying in grid table on page
 */
var Grid = (function () {
    function Grid(html_id) {
        this.element = document.getElementById(html_id); // get DOM object ID. 
        this.nrOfRecords = 0; // total nr of records on server
        this.recordsPerPage = 30; // display this many records per page
        this.displayFrom = 0; // display from this index
        this.displayTo = 0; // display to this index
        this.gridHeadingString = ""; // grid table heading 
    }
    Grid.prototype.setupEvents = function () {
        var _this = this;
        var resizeTimer;
        // 'debounce' window resize event to prevent multiple calls on each resize.
        $(window).resize(function () {
            var documentHeight = $(window).height(); //retrieve current document height
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                _this.recordsPerPage = (Math.floor((documentHeight - 109) / 25)) - 2;
                _this.displayTo = _this.displayFrom + _this.recordsPerPage;
                _this.getGridRecords();
            }, 200);
        });
        // On-click event handler for PAGE DOWN button
        $('#but_pagedown').click(function () {
            _this.page(_this.recordsPerPage);
        });
        // On-click event handler for PAGE UP button
        $('#but_pageup').click(function () {
            _this.page(-_this.recordsPerPage);
        });
        // On-click event handler for GO button --> trigger .goto method
        $('#but_go').click(function () {
            _this.goto();
        });
        // On-click event handler for HOME button
        $('#but_home').click(function () {
            $('#grid_show_from:text').val("0");
            _this.goto();
        });
        // Text input event handler for 'show from ID' input (prevents invalid input)
        $('#grid_show_from:text').keypress(function (e) {
            //if the letter is not a digit then don't type anything
            if (e.which != 8 && e.which != 13 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                return false;
            }
            if (e.which == 13) {
                _this.goto();
            }
        });
    };
    /*  Get grid records:
     *  a) retrieve JSON data for specific record range (Grid.display_from .. display_to) from server
     *  b) parse data using jQuery .each which uses JSON structure to create html table string
     *  c) Add (b) to header string created during grid init --> update html table element.
     */
    Grid.prototype.getGridRecords = function () {
        var _this = this;
        var populateGridRecords = function (json_input) {
            var out = "<table>"; // "<table border='1' style='width:100%' >";
            $.each(json_input, function () {
                out += "<tr>";
                $.each(this, function (key, value) {
                    out += "<td>" + value + "</td>";
                });
                out += "</tr>";
            });
            out += "</table>";
            document.getElementById("table1").innerHTML = _this.gridHeadingString + out;
        };
        $.getJSON("http://localhost:2050/records?from=" + this.displayFrom.toString() + "&to=" + this.displayTo.toString(), function (data) {
            populateGridRecords(data);
        }).fail(function (data, textStatus, error) {
            alert("Page request failure!  \nDetails: getJSON(get DB records) FAILED, \nStatus:" + textStatus + ", error: " + error);
        });
    };
    /*  Initialize grid:
     *  a) Determine nr of rows to display based on window height --> set display_from, display_to
     *  b) Retrieve recordcount and grid header from server, store in Grid object
     */
    Grid.prototype.initGrid = function () {
        var _this = this;
        var documentHeight = $(window).height(); //retrieve current document height
        this.recordsPerPage = (Math.floor((documentHeight - 109) / 25)) - 2;
        this.displayTo = this.displayFrom + this.recordsPerPage;
        //this.getGridRecords();
        // retrieve recordCount from server
        $.getJSON("http://localhost:2050/recordCount", function (data) {
            _this.nrOfRecords = data;
        }).fail(function (data, textStatus, error) {
            alert("Page request failure!  \nDetails: getJSON(get DB columns) FAILED, \nStatus:" + textStatus + ", error: " + error);
        });
        // retrieve grid header from server 
        $.getJSON("http://localhost:2050/columns", function (data) {
            _this.gridHeadingString = parseGridHeading(data);
            _this.getGridRecords();
        }).fail(function (data, textStatus, error) {
            alert("Page request failure!  \nDetails: getJSON (get DB columns) FAILED, \nStatus:" + textStatus + ", error: " + error);
        });
        // parse data table's header row (column names), store as html string in .gridHeadingString
        var parseGridHeading = function (json_input) {
            var out = "<tr>";
            $.each(json_input, function (key, value) {
                out += "<th>" + value + "</th>";
            });
            return out + "</tr>";
        };
    };
    // ------------------------------------------------------------- Grid: Private
    /*  Goto: display records starting from a specific index value
     *  a) read number from html input box, adjust .display_from and -to.
     *  b) check and readjust range if indices fall below 0 or above .nr_of_records
     *  c) call .getGridRecords() method to fetch and display new record range
     */
    Grid.prototype.goto = function () {
        var goto_id = $('#grid_show_from:text').val();
        var num = parseInt(goto_id);
        //goto_id = 
        if (($('#grid_show_from:text').val()).length == 0) {
            alert("EMPTY INPUT.  Re-enter ID value");
            return false;
        }
        this.displayFrom = num;
        this.displayTo = num + this.recordsPerPage;
        if (this.displayTo > 999999) {
            this.displayTo = 999999;
            this.displayFrom = 999999 - this.recordsPerPage;
        }
        this.getGridRecords();
    };
    ;
    /*  Page: display next/previous page of records
     *  a) adjust .display_from and .display_to values by .page_length
     *  b) check and readjust range if indices fall below 0 or above .nr_of_records
     *  c) call .getGridRecords() method to fetch and display new record range
     */
    Grid.prototype.page = function (page_length) {
        this.displayFrom += page_length;
        this.displayTo += page_length;
        // adjust range if indices fall outside limits
        if (this.displayTo > this.nrOfRecords) {
            this.displayTo = this.nrOfRecords;
            this.displayFrom = this.displayTo - this.recordsPerPage;
        }
        ;
        if (this.displayFrom < 0) {
            this.displayFrom = 0;
            this.displayTo = this.recordsPerPage;
        }
        ;
        // fetch new data records from server and update html table rows
        this.getGridRecords();
    };
    return Grid;
}());
// --------------------------------------------- END class Grid ------------------------------------------
window.onload = function () {
    // make Grid object by passing html id as string. getElementByID is performed inside Grid constructor
    var grid1 = new Grid("content");
    // initialize grid: 
    grid1.initGrid();
    // register grid events (buttons, window resize, input control)
    grid1.setupEvents();
    // get records in specific range from server and populate grid table rows
    grid1.getGridRecords();
};
//# sourceMappingURL=app.js.map