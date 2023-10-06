"use strict";
//*** Model ***/
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
/** Manages the application's state for data display, navigation, and search functionalities. */
var StateManager = /** @class */ (function () {
    function StateManager(apiManager) {
        this.highlightedId = null;
        this.records = null;
        this.totalRecordCount = 0;
        this.rowHeight = 20;
        this.headerHeight = 180;
        this.availableHeight = 0;
        this.numRows = 0;
        this.apiManager = apiManager;
        this.from = 0;
        this.to = 0;
        this.columnNames = null;
        this.totalRecordCount = 0;
    }
    StateManager.prototype.getHighlightedId = function () {
        return this.highlightedId;
    };
    StateManager.prototype.setHighlightedId = function (value) {
        this.highlightedId = value;
    };
    /** Sets up initial state, fetches record count and column names, and adjusts the display window size. */
    StateManager.prototype.initializeState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.fetchAndStoreTotalRecordCount()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.retrieveColumnNames()];
                    case 2:
                        _a.sent();
                        this.adjustWindowSize();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error in initializeState:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.retrieveColumnNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.apiManager.fetchColumnNames()];
                    case 1:
                        _a.sent();
                        if (this.apiManager.columnNames !== null) {
                            this.columnNames = this.apiManager.columnNames;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error in retrieveColumnNames:", error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.fetchAndStoreTotalRecordCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.apiManager.fetchTotalRecordCount()];
                    case 1:
                        _a.sent();
                        this.totalRecordCount = this.apiManager.totalRecordCount;
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error in fetchAndStoreTotalRecordCount:", error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.getTotalRecordCount = function () {
        return this.totalRecordCount;
    };
    StateManager.prototype.getColumnNames = function () {
        return this.columnNames;
    };
    StateManager.prototype.getRecords = function () {
        return this.records;
    };
    StateManager.prototype.getFrom = function () {
        return this.from;
    };
    StateManager.prototype.setFrom = function (value) {
        this.from = value;
    };
    StateManager.prototype.getTo = function () {
        return this.to;
    };
    StateManager.prototype.setTo = function (value) {
        this.to = value;
    };
    StateManager.prototype.goToNextPage = function () {
        try {
            var from = this.getFrom();
            var to = this.getTo();
            var recordsPerPage = this.numRows;
            var newFrom = from + recordsPerPage;
            var newTo = newFrom + recordsPerPage - 1;
            // Check that 'to' does not exceed totalRecordCount.
            if (newTo >= this.totalRecordCount) {
                this.setTo(this.totalRecordCount - 1);
                this.setFrom(this.totalRecordCount - recordsPerPage);
            }
            else {
                this.setFrom(newFrom);
                this.setTo(newTo);
            }
        }
        catch (error) {
            console.error("Unexpected error in goToNextPage: " + (error instanceof Error ? error.message : error));
        }
    };
    StateManager.prototype.goToPreviousPage = function () {
        try {
            var from = this.getFrom();
            var to = this.getTo();
            var recordsPerPage = this.numRows;
            var newFrom = from - recordsPerPage;
            var newTo = newFrom + recordsPerPage - 1;
            // Check that 'from' does not exceed 0.
            if (newFrom < 0) {
                this.setFrom(0);
                this.setTo(recordsPerPage - 1);
            }
            else {
                this.setFrom(newFrom);
                this.setTo(newTo);
            }
        }
        catch (error) {
            console.error("Error in goToPreviousPage: " + (error instanceof Error ? error.message : error));
        }
    };
    StateManager.prototype.searchByIdStateChange = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var newFrom, newTo, recordsPerPage, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        newFrom = id;
                        newTo = id + this.numRows - 1;
                        recordsPerPage = this.numRows;
                        // Checking that 'to' does not exceed totalRecordCount.
                        if (newTo >= this.totalRecordCount) {
                            this.setTo(this.totalRecordCount - 1);
                            this.setFrom(this.totalRecordCount - recordsPerPage);
                        }
                        else {
                            this.setTo(newTo);
                            this.setFrom(newFrom);
                        }
                        return [4 /*yield*/, this.retrieveRecords()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error in searchByIdStateChange: " + (error_4 instanceof Error ? error_4.message : error_4));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Adjusts the available height based on window size and recalculates the number of rows. */
    StateManager.prototype.adjustWindowSize = function () {
        try {
            if (typeof window === "undefined" || !window.innerHeight) {
                throw new Error("Unable to access window dimensions");
            }
            // Determine the dynamic height of the header and pagination.
            var mainHeadingElement = document.getElementById("main-heading");
            var paginationElement = document.getElementById("pagination");
            if (mainHeadingElement && paginationElement) {
                this.headerHeight =
                    mainHeadingElement.clientHeight +
                        paginationElement.clientHeight;
            }
            else {
                console.error("Could not find main-heading and/or pagination elements");
            }
            if (!this.rowHeight) {
                throw new Error("Row height is not properly configured");
            }
            this.availableHeight =
                window.innerHeight - this.headerHeight - this.rowHeight * 2;
            this.numRows = Math.floor(this.availableHeight / this.rowHeight);
            if (this.numRows <= 0) {
                console.log("Window size too small, setting minimum number of rows to 1");
                this.numRows = 1;
            }
            // Calculating new values without modifying the state immediately.
            var newFrom = this.from;
            var newTo = this.from + this.numRows - 1;
            // If it's the first set of records ("first page"), start from 0 and populate the whole window size.
            if (this.from === 0) {
                newFrom = 0;
                newTo = this.numRows - 1;
            }
            // Ensure `newTo` doesn't exceed totalRecordCount and adjust `newFrom` accordingly,
            // meaning populate the whole window size.
            if (newTo >= this.totalRecordCount) {
                newTo = this.totalRecordCount - 1;
                newFrom = newTo - this.numRows + 1;
            }
            // Check if the highlighted ID is currently between from and to,
            // too enable priority functionality (always visible in the window).
            var highlightedId = this.getHighlightedId();
            if (highlightedId !== null &&
                highlightedId >= this.from &&
                highlightedId <= this.to) {
                // If newTo would be smaller than highlightedId, adjust to keep highlightedId in view.
                if (newTo < highlightedId) {
                    newTo = highlightedId;
                    newFrom = newTo - this.numRows + 1;
                }
            }
            // Now, after all conditions have been checked, set the state.
            this.setFrom(newFrom);
            this.setTo(newTo);
        }
        catch (error) {
            console.error("Error in adjustWindowSize: " + (error instanceof Error ? error.message : error));
        }
    };
    StateManager.prototype.retrieveRecords = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.apiManager.fetchRecords(this.from, this.to)];
                    case 1:
                        _a.records = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        console.error("Error retrieving records: " + (error_5 instanceof Error ? error_5.message : error_5));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StateManager;
}());
//# sourceMappingURL=model.js.map