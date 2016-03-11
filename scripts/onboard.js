var grid, refreshHandle = 99;
$(function () {
    grid = new iq.onboard.Grid("#grid");
    initialize();
});
function initialize() {
    disableformSubmission();
    initNavigationHandlers();
    initControlPanel();
    initResizeHandler();
}
function disableformSubmission() {
    $("form").submit(function () {
        return false;
    });
}
function initNavigationHandlers() {
    $("#next-button").click(function () {
        grid.pageBy(1);
        updatePageDisplay(grid.getPageNumber());
    });
    $("#prev-button").click(function () {
        grid.pageBy(-1);
        updatePageDisplay(grid.getPageNumber());
    });
    $("#first-button").click(function () {
        grid.pageToFirst();
        updatePageDisplay(grid.getPageNumber());
    });
    $("#last-button").click(function () {
        grid.pageToLast();
        updatePageDisplay(grid.getPageNumber());
    });
}
function initControlPanel() {
    initControlPanelAnimation();
    initNavigationControlAnimation();
    initPageSelector();
}
function initControlPanelAnimation() {
    var _this = this;
    var $controlPanel = $(".control-panel");
    $controlPanel.mouseenter(function () {
        $(_this).stop(true, true);
        $(_this).fadeTo("slow", 1.0);
    });
    $controlPanel.mouseleave(function () {
        $(_this).stop(true, true);
        $(_this).fadeTo("slow", 0.0);
    });
}
function initNavigationControlAnimation() {
    var _this = this;
    var $control = $(".control");
    $control.mouseenter(function () {
        $(_this).addClass("control-selected");
    });
    $control.mouseleave(function () {
        $(_this).removeClass("control-selected");
    });
}
function initPageSelector() {
    var _this = this;
    var $pageSelector = $("#page-selector");
    $pageSelector.change(function () {
        grid.pageTo(parseInt($(_this).val()) - 1);
        updatePageDisplay(grid.getPageNumber());
    });
}
function updatePageDisplay(page) {
    var $pageSelector = $("#page-selector");
    $pageSelector.val(page + 1); // Account for zero based indexing of pages
}
function initResizeHandler() {
    $(window).resize(function () {
        clearTimeout(refreshHandle);
        refreshHandle = setTimeout(function () { grid.redraw(); }, 250);
    });
}
/// <reference path="../scripts/typings/jquery/jquery.d.ts" />
var iq;
(function (iq) {
    var onboard;
    (function (onboard) {
        /*
        * Generic tabulated data handling class.
        * Provides functionality for connecting the specific API for the onboarding project
        * and loading the records into a given html table
        */
        var Grid = (function () {
            function Grid(table) {
                this.table = table;
                this.numberOfRecords = -1;
                this.page = 0;
                this.numberOfPages = -1;
                this.recordsPerPage = Grid.DefaultRecordsPerPage;
                this.rowFactory = new onboard.RowFactory();
                this.redraw();
            }
            ;
            /*
            * Remeasure the table constraints and refresh data display
            */
            Grid.prototype.redraw = function () {
                this.loadColumnHeaders();
            };
            /*
            * Switches to the page which is [offset] pages from the current page
            */
            Grid.prototype.pageBy = function (offset) {
                this.pageTo(this.page + offset);
                return this.page;
            };
            ;
            /*
            * Switch to the first page
            */
            Grid.prototype.pageToFirst = function () {
                this.pageTo(0);
            };
            ;
            /*
            * Switch to the last page
            */
            Grid.prototype.pageToLast = function () {
                this.pageTo(this.numberOfPages - 1);
            };
            ;
            /*
            * Sets the zero based page number and updates the grid data
            */
            Grid.prototype.pageTo = function (page) {
                if (page >= this.numberOfPages) {
                    console.log("Cant page to " + (page + 1) + " because there are only " + this.numberOfPages + " pages!");
                    page = this.numberOfPages - 1;
                }
                if (page < 0) {
                    console.log("Page number must be positive!");
                    page = 0;
                }
                this.page = page;
                this.loadRecords(this.page * this.recordsPerPage, this.recordsPerPage - 1);
            };
            ;
            /*
            * Gets the currently displayed page number (zero based)
            */
            Grid.prototype.getPageNumber = function () {
                return this.page;
            };
            ;
            /*
            * Gets the total number of pages in the record set
            */
            Grid.prototype.getNumberOfPages = function () {
                return this.numberOfPages;
            };
            ;
            Grid.prototype.loadNumberOfRecords = function () {
                var _this = this;
                $.getJSON("/recordCount", function (val) {
                    _this.numberOfRecords = val;
                    // Calculate the number of rows that will fit on the screen ( less the header and padding)
                    _this.recordsPerPage = Math.floor($(_this.table).height() / $("tr:first-child").height()) - 2;
                    _this.numberOfPages = Math.ceil(_this.numberOfRecords / _this.recordsPerPage);
                    _this.pageTo(_this.page);
                });
            };
            ;
            Grid.prototype.loadColumnHeaders = function () {
                var _this = this;
                $.getJSON("/columns", function (val) {
                    _this.setColumnHeaders(val);
                    _this.loadNumberOfRecords();
                });
            };
            ;
            Grid.prototype.loadRecords = function (skip, count) {
                var _this = this;
                var end = skip + count;
                $.getJSON("/records?from=" + skip + "&to=" + end, function (records) {
                    _this.clearData();
                    _this.addData(records);
                });
            };
            ;
            Grid.prototype.setColumnHeaders = function (cols) {
                var $table = $(this.table);
                if ($table) {
                    $table.find("tr").remove(); // Remove any existing data/header row
                    $table.append(this.rowFactory.createHeaderRow(cols));
                    // Append a filler row to prevent header row expanding across table
                    $table.append($("<tr class='filler'><td>Fetching data...</td></tr>"));
                }
            };
            ;
            Grid.prototype.clearData = function () {
                var $table = $(this.table);
                if ($table) {
                    $table.find("tr:gt(0)").remove(); // Removes all except first (header) row
                }
            };
            ;
            Grid.prototype.addData = function (records) {
                var $table = $(this.table);
                if ($table) {
                    for (var ind in records) {
                        $table.append(this.rowFactory.createDataRow(records[ind]));
                    }
                }
            };
            ;
            Grid.DefaultRecordsPerPage = 20;
            return Grid;
        }());
        onboard.Grid = Grid;
    })(onboard = iq.onboard || (iq.onboard = {}));
})(iq || (iq = {}));
var iq;
(function (iq) {
    var onboard;
    (function (onboard) {
        /*
        * Generator class for new table rows/cells
        */
        var RowFactory = (function () {
            function RowFactory() {
            }
            /*
            * Creates a new table row element populated with table header cells with the given data
            */
            RowFactory.prototype.createHeaderRow = function (values) {
                var $row = $("<tr></tr>");
                for (var index in values) {
                    $row.append(this.createHeaderCell(values[index]));
                }
                return $row;
            };
            /*
            * Creates a new html table row element populated with the given data
            */
            RowFactory.prototype.createDataRow = function (values) {
                var $row = $("<tr></tr>");
                for (var index in values) {
                    $row.append(this.createDataCell(values[index]));
                }
                return $row;
            };
            RowFactory.prototype.createHeaderCell = function (content) {
                return $("<th></th>").html(content ? content : "");
            };
            RowFactory.prototype.createDataCell = function (content) {
                return $("<td></td>").html(content ? content : "");
            };
            return RowFactory;
        }());
        onboard.RowFactory = RowFactory;
    })(onboard = iq.onboard || (iq.onboard = {}));
})(iq || (iq = {}));
//# sourceMappingURL=onboard.js.map