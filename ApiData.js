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
//class to fetch and manage data from the api 
var ApiData = /** @class */ (function () {
    function ApiData(pageSize) {
        var _this = this;
        this.currentPage = 1;
        this.data = [];
        this.totalItems = 0;
        this.columnNames = [];
        this.maxGridHeight = 0;
        this.firstVal = 0;
        this.handleResize = function () {
            var newWindowHeight = Math.floor($(window).innerHeight());
            var newGridSize = Math.floor((newWindowHeight * gridRatio) / rowHeight) - 1;
            // Check if the new grid size is non-negative
            if (newGridSize >= 0) {
                var newPageSize = newGridSize;
                var newFirstValueIndex = _this.firstVal;
                // Adjust firstVal for the last page
                if (newFirstValueIndex + newPageSize > _this.totalItems) {
                    newFirstValueIndex = Math.max(_this.totalItems - newPageSize);
                }
                // Update firstVal, lastVal, and page size
                _this.pageSize = newPageSize;
                _this.firstVal = newFirstValueIndex;
                _this.lastVal = newFirstValueIndex + newPageSize - 1;
                // Fetch records, update page info, and adjust grid height
                _this.fetchRecords();
                _this.updatePageInfo();
                _this.adjustGridHeight();
            }
        };
        this.displayRecords = function () {
            var gridTemplate = new GridTemplate(_this.columnNames, _this.data);
            gridTemplate.displayRecords();
            _this.updatePageInfo();
        };
        this.pageSize = pageSize;
    }
    ;
    // Initialize method to set up the grid
    ApiData.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        this.adjustGridHeight();
                        return [4 /*yield*/, this.recordCount()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.fetchColumns()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.fetchRecords()];
                    case 3:
                        _a.sent();
                        this.setupControls();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error during initialization:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ;
    // Method to fetch total record count from the server
    ApiData.prototype.recordCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fetchData('http://localhost:2050/recordCount')];
                    case 1:
                        response = _a.sent();
                        this.totalItems = typeof response === 'number' ? response : parseInt(response, 10);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error('Failed to fetch record count.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    //fectch column names
    ApiData.prototype.fetchColumns = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, res, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fetchData('http://localhost:2050/columns')];
                    case 1:
                        response = _a.sent();
                        res = JSON.parse(response);
                        this.columnNames = res.map(function (columnName) { return ({ name: columnName }); });
                        this.data = new Array(this.columnNames.length);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error('Failed to fetch columns.');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    //get records from API for fetch an search functionality 
    ApiData.prototype.fetchAndProcessRecords = function (from, to) {
        if (from === void 0) { from = this.firstVal; }
        return __awaiter(this, void 0, void 0, function () {
            var response, res, processedData, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        $('#spinner').show();
                        $('#grid').hide();
                        return [4 /*yield*/, this.fetchData("http://localhost:2050/records?from=" + from + "&to=" + to)];
                    case 1:
                        response = _a.sent();
                        res = JSON.parse(response);
                        processedData = res.map(function (record) {
                            var obj = {};
                            var columnIndex = 0;
                            for (var _i = 0, _a = _this.columnNames; _i < _a.length; _i++) {
                                var column = _a[_i];
                                if (columnIndex < record.length) {
                                    var columnName = column.name;
                                    var columnValue = record[columnIndex];
                                    obj[columnName] = columnValue;
                                }
                                columnIndex++;
                            }
                            return obj;
                        });
                        $('#spinner').hide();
                        $('#grid').show();
                        return [2 /*return*/, processedData];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error('Failed to fetch records');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    //fetch records from api
    ApiData.prototype.fetchRecords = function () {
        return __awaiter(this, void 0, void 0, function () {
            var maxRange, from, to, processedData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxRange = this.totalItems - 1;
                        from = this.firstVal;
                        to = Math.min(from + this.pageSize, maxRange);
                        if (to >= maxRange) {
                            this.currentPage = Math.floor(maxRange / this.pageSize) + 1; // Set currentPage to the last page
                            to = maxRange;
                        }
                        ;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchAndProcessRecords(from, to)];
                    case 2:
                        processedData = _a.sent();
                        this.data = processedData;
                        this.displayRecords();
                        this.updatePageInfo();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        throw new Error('Failed to fetch records');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    //funtion to search through records using fromID
    ApiData.prototype.searchRecords = function (searchValue) {
        return __awaiter(this, void 0, void 0, function () {
            var maxRange, from, to, processedData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        maxRange = this.totalItems - 1;
                        if (!(searchValue >= 0 && searchValue <= maxRange)) return [3 /*break*/, 2];
                        from = searchValue;
                        to = Math.min(from + this.pageSize, maxRange);
                        return [4 /*yield*/, this.fetchAndProcessRecords(from, to)];
                    case 1:
                        processedData = _a.sent();
                        this.data = processedData;
                        this.currentPage = Math.ceil(from / this.pageSize) + 1;
                        this.firstVal = from; // Set firstVal to searched value
                        this.lastVal = from + this.pageSize; // Calculate lastVal based on pageSize
                        this.displayRecords();
                        this.updatePageInfo();
                        return [3 /*break*/, 3];
                    case 2:
                        alert('Please enter values in the range (0-999999)');
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        throw new Error('Failed to search value');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ;
    //chnge grid height according to screen size
    ApiData.prototype.adjustGridHeight = function () {
        var gridElement = document.getElementById('grid');
        var pageCntrl = $('.grid-controls').innerHeight();
        var screenHeight = $(window).innerHeight();
        if (gridElement && pageCntrl !== undefined && screenHeight !== undefined) {
            this.maxGridHeight = screenHeight - pageCntrl;
            gridElement.style.height = this.maxGridHeight + "px";
        }
    };
    ;
    // Update the page information and records display based on the current state of the grid.
    ApiData.prototype.updatePageInfo = function () {
        var totalPages = Math.ceil(this.totalItems / this.pageSize);
        var pageInfo = "Page " + this.currentPage + " of " + totalPages;
        var maxRange = this.totalItems - 1;
        var from = this.firstVal;
        var to = Math.min(from + this.pageSize, maxRange);
        $('#pageInfo').text("" + pageInfo);
        $('.records').text("Showing records " + from + " to " + to);
    };
    ;
    // use Ajax for data fetching
    ApiData.prototype.fetchData = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        $('#overlay').show();
                        return [4 /*yield*/, $.ajax({
                                url: url,
                                method: 'GET',
                            })];
                    case 1:
                        response = _a.sent();
                        $('#overlay').hide();
                        return [2 /*return*/, response];
                    case 2:
                        error_7 = _a.sent();
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    ApiData.prototype.setupControls = function () {
        var _this = this;
        $('#prevBtn').on('click', function () { return _this.handlePageChange(-1); });
        $('#nextBtn').on('click', function () { return _this.handlePageChange(1); });
        $(window).on('resize', debounce(this.handleResize, 350));
    };
    ;
    ApiData.prototype.handlePageChange = function (delta) {
        var newFirstVal = this.firstVal + delta * this.pageSize;
        if (newFirstVal >= 0 && newFirstVal <= this.totalItems - 1) {
            this.firstVal = newFirstVal;
            this.lastVal = this.firstVal + this.pageSize - 1;
            this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;
            this.fetchRecords();
        }
        else if (newFirstVal <= this.pageSize) {
            this.firstVal = 0;
            this.lastVal = this.firstVal + this.pageSize - 1;
            this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;
            this.fetchRecords();
        }
        ;
    };
    ;
    return ApiData;
}());
//# sourceMappingURL=ApiData.js.map