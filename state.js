"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Code is only triggered once per user input
var debounce = function (fn, ms) {
    var timeoutId;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () { return fn.apply(_this, args); }, ms);
    };
};
var State = /** @class */ (function () {
    function State() {
        // Starting values for when page is first loaded
        this.records = this.calculateRecords();
        this.trimStart = 0;
        this.trimEnd = this.records - 1;
        // Default values for server data variables
        this.RECORDCOUNT = 350;
        this.HEADERS = ["ID", "City", "Population"];
        this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];
        this.contentTable = document.getElementById('content-table');
        this.tableBody = document.querySelector('tbody');
        this.tableHead = document.getElementById('content-thead');
        this.pageInfo = document.getElementById('page-info');
        this.searchBtn = document.getElementById('id-search-btn');
        this.firstBtn = document.getElementById('first');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.lastBtn = document.getElementById('last');
        this.inputBox = document.getElementById('id-search');
    }
    // Record count and headers should not be changed outside the class
    // hence there are only get methods for them
    State.prototype.getRecordCount = function () {
        return this.RECORDCOUNT;
    };
    State.prototype.getHeaders = function () {
        return this.HEADERS;
    };
    State.prototype.calculateRecords = function () {
        // Estimate of available table space
        // The calculation is an estimate of how many space there is for rows
        // 160 is estimate space for header and footer of website and 40 is estimated space of a single row
        return Math.floor((window.innerHeight - 160) / 40);
    };
    // The setPageButtons, setSearchButton, and setResizeEvent are seperate functions
    // so that only the needed functions are used
    State.prototype.setPageButtons = function () {
        var _this = this;
        // Event listener for button that goes to first page
        this.firstBtn.addEventListener("click", debounce(function () {
            _this.goToFirst();
        }, 250));
        // Event listener for button that goes to previous page
        this.prevBtn.addEventListener("click", debounce(function () {
            _this.goToPrev();
        }, 250));
        // Event listener for button that goes to next page
        this.nextBtn.addEventListener("click", debounce(function () {
            _this.goToNext();
        }, 250));
        // Event listener for button that goes to last page
        this.lastBtn.addEventListener("click", debounce(function () {
            _this.goToLast();
        }, 250));
    };
    State.prototype.setSearchButton = function () {
        var _this = this;
        // // Event listener for button that searches entered ID
        this.searchBtn.addEventListener("click", debounce(function () {
            _this.searchId();
        }, 250));
    };
    State.prototype.setResizeEvent = function () {
        var _this = this;
        // Event listener for when user resizes the page
        window.addEventListener("resize", debounce(function () {
            _this.resize();
        }, 150)); // Log window dimensions at most every 150ms
    };
    // Fetch headers and record count
    State.prototype.getData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // API calls for record count and headers
                    return [4 /*yield*/, fetch('/recordCount')
                            .then(function (resp) {
                            if (resp.ok) {
                                return resp.json();
                            }
                            throw new Error('Could not retrieve data');
                        })
                            .then(function (count) {
                            _this.RECORDCOUNT = count;
                        })
                            .catch(function (error) {
                            console.error(error);
                        })];
                    case 1:
                        // API calls for record count and headers
                        _a.sent();
                        return [4 /*yield*/, fetch('/columns')
                                .then(function (resp) {
                                if (resp.ok) {
                                    return resp.json();
                                }
                                throw new Error('Could not retrieve data');
                            })
                                .then(function (count) {
                                _this.HEADERS = count;
                            })
                                .catch(function (error) {
                                console.error(error);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // Add rows to table
    State.prototype.addRows = function (start, end) {
        return __awaiter(this, void 0, void 0, function () {
            var table, newTableBody, oldTableBody, link, _i, _a, row, rowElement, _b, row_1, cellText, cellElement;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        table = document.getElementById("content-table");
                        newTableBody = document.createElement("tbody");
                        oldTableBody = table.querySelector("tbody");
                        link = "/records?from=" + start + "&to=" + end;
                        return [4 /*yield*/, fetch(link)
                                .then(function (resp) {
                                if (resp.ok) {
                                    return resp.json();
                                }
                                throw new Error('Could not retrieve data');
                            })
                                .then(function (count) {
                                _this.data = count;
                            })
                                .catch(function (error) {
                                console.error(error);
                            })];
                    case 1:
                        _c.sent();
                        for (_i = 0, _a = this.data; _i < _a.length; _i++) {
                            row = _a[_i];
                            rowElement = document.createElement("tr");
                            for (_b = 0, row_1 = row; _b < row_1.length; _b++) {
                                cellText = row_1[_b];
                                cellElement = document.createElement("td");
                                cellElement.textContent = cellText;
                                rowElement.appendChild(cellElement); // Append cells to row
                            }
                            newTableBody.appendChild(rowElement); // Append rows to tbody
                        }
                        // If table exists, replace the new tbody with the old one
                        if (!table) {
                            console.error("Table is undefined");
                            return [2 /*return*/];
                        }
                        else {
                            table.replaceChild(newTableBody, oldTableBody);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Delete rows from table
    State.prototype.deleteRows = function (newHeight, diff) {
        var tableBod = this.contentTable.querySelector('tbody');
        var num = newHeight - 1;
        for (var i = num; i > (num + diff); i--) {
            tableBod.deleteRow(i);
        }
    };
    // Load json data into table function
    State.prototype.loadIntoTable = function (clearHeader) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Display loader
        $(".content").fadeOut(230);
        $(".loader").fadeIn(230);
        // UI "Aesthetic": update buttons
        (_a = this.firstBtn) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
        (_b = this.prevBtn) === null || _b === void 0 ? void 0 : _b.removeAttribute("disabled");
        (_c = this.nextBtn) === null || _c === void 0 ? void 0 : _c.removeAttribute("disabled");
        (_d = this.lastBtn) === null || _d === void 0 ? void 0 : _d.removeAttribute("disabled");
        if (this.trimEnd == this.getRecordCount() - 1) {
            (_e = this.lastBtn) === null || _e === void 0 ? void 0 : _e.setAttribute("disabled", "disabled");
            (_f = this.nextBtn) === null || _f === void 0 ? void 0 : _f.setAttribute("disabled", "disabled");
        }
        if (this.trimStart == 0) {
            (_g = this.firstBtn) === null || _g === void 0 ? void 0 : _g.setAttribute("disabled", "disabled");
            (_h = this.prevBtn) === null || _h === void 0 ? void 0 : _h.setAttribute("disabled", "disabled");
        }
        this.pageInfo.innerHTML = "<p></p>";
        // Add header only if 'clearHeader' is true
        if (clearHeader) {
            this.tableHead.innerHTML = "";
            var headerRow = document.createElement("tr");
            // Populate the headers
            for (var _i = 0, _j = this.getHeaders(); _i < _j.length; _i++) {
                var headerText = _j[_i];
                var headerElement = document.createElement("th");
                headerElement.textContent = headerText;
                headerRow.appendChild(headerElement);
            }
            this.tableHead.appendChild(headerRow);
        }
        // Clear the table
        this.tableBody.innerHTML = "";
        // Add only records that must be displayed on table
        this.addRows(this.trimStart, this.trimEnd);
        // Display content
        $(".loader").fadeOut(230);
        $(".content").fadeIn(230);
    };
    // Search entered ID
    State.prototype.searchId = function () {
        var id = parseInt(this.inputBox.value);
        var numRecords = this.getRecordCount() - 1;
        if (id < 0 || id > numRecords || isNaN(id)) {
            // User info: Display error message
            this.pageInfo.innerHTML = "<p>No records to display</p>";
        }
        else {
            // Use entered ID to calculate what records should display
            if ((this.getRecordCount() - 1) - id >= this.records) {
                this.trimStart = id;
                this.trimEnd = this.trimStart + (this.records - 1);
            }
            else {
                this.trimEnd = this.getRecordCount() - 1;
                this.trimStart = this.trimEnd - this.records + 1;
            }
            this.loadIntoTable(false);
        }
        document.getElementById('id-search').value = 'Enter ID number';
    };
    // Set trim to start of data
    State.prototype.goToFirst = function () {
        this.trimStart = 0;
        this.trimEnd = this.trimStart + this.records - 1;
        this.loadIntoTable(false);
    };
    // Set trim to previous data
    State.prototype.goToPrev = function () {
        // If previous page is end of data && there are not enough records to fill window
        if ((this.trimStart - 1) - (this.records - 1) < 0) {
            this.trimStart = 0;
            this.trimEnd = this.trimStart + this.records - 1;
        }
        else {
            this.trimEnd = this.trimStart - 1;
            this.trimStart = this.trimEnd - this.records + 1;
        }
        this.loadIntoTable(false);
    };
    // Set trim to next data
    State.prototype.goToNext = function () {
        // If next page is end of data && there are not enough records to fill window
        if ((this.getRecordCount() - 1) - (this.trimEnd + 1) < this.records) {
            this.trimEnd = this.getRecordCount() - 1;
            this.trimStart = this.trimEnd - this.records + 1;
        }
        else {
            this.trimStart = this.trimEnd + 1;
            this.trimEnd = this.trimStart + this.records - 1;
        }
        this.loadIntoTable(false);
    };
    // Set trim to end of data
    State.prototype.goToLast = function () {
        this.trimEnd = this.getRecordCount() - 1;
        this.trimStart = this.trimEnd - this.records + 1;
        this.loadIntoTable(false);
    };
    // Add/remove rows from table based on resize event of the window
    State.prototype.resize = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var newHeight, diff, start, end;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        newHeight = this.calculateRecords();
                        diff = newHeight - this.records;
                        start = this.trimStart;
                        end = this.trimEnd + diff;
                        if (!(diff < 0)) return [3 /*break*/, 1];
                        // If screen is made smaller, call delete rows function with this.records (amount of rows that were on the screen)
                        // and diff (how many rows should be deleted)
                        this.deleteRows(this.records, diff);
                        this.trimEnd = this.trimEnd + diff;
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(diff > 0 && end >= this.getRecordCount())) return [3 /*break*/, 3];
                        // Prepend rows as last page gets bigger
                        end = this.getRecordCount() - 1;
                        start = end - (newHeight - 1);
                        console.log("End reached, displaying record ", start, " to ", end);
                        return [4 /*yield*/, this.addRows(start, end)];
                    case 2:
                        _j.sent();
                        this.trimStart = this.trimStart - diff;
                        this.trimEnd = this.getRecordCount() - 1;
                        return [3 /*break*/, 4];
                    case 3:
                        if (diff > 0 && start <= this.getRecordCount() - 1) {
                            // Add rows if end of data is not yet reached
                            this.addRows(start, end);
                            this.trimEnd = this.trimEnd + diff;
                        }
                        _j.label = 4;
                    case 4:
                        this.records = newHeight;
                        // UI "Aesthetic": update buttons
                        (_a = this.firstBtn) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
                        (_b = this.prevBtn) === null || _b === void 0 ? void 0 : _b.removeAttribute("disabled");
                        (_c = this.nextBtn) === null || _c === void 0 ? void 0 : _c.removeAttribute("disabled");
                        (_d = this.lastBtn) === null || _d === void 0 ? void 0 : _d.removeAttribute("disabled");
                        if (this.trimEnd == this.getRecordCount() - 1) {
                            (_e = this.lastBtn) === null || _e === void 0 ? void 0 : _e.setAttribute("disabled", "disabled");
                            (_f = this.nextBtn) === null || _f === void 0 ? void 0 : _f.setAttribute("disabled", "disabled");
                        }
                        if (this.trimStart == 0) {
                            (_g = this.firstBtn) === null || _g === void 0 ? void 0 : _g.setAttribute("disabled", "disabled");
                            (_h = this.prevBtn) === null || _h === void 0 ? void 0 : _h.setAttribute("disabled", "disabled");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return State;
}());
//# sourceMappingURL=state.js.map