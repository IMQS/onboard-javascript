"use strict";
//*** Controllers ***/
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
// Handles window resize events to update the view of the application.
var WindowResizeHandler = /** @class */ (function () {
    /**
     * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
     * @param {StateManager} stateManager - State control for retrieving/updating application data.
     */
    function WindowResizeHandler(tableRenderer, stateManager, paginationManager) {
        this.debouncedUpdate = this.debounce(this.updateAfterResize.bind(this), 350);
        this.paginationManager = paginationManager;
        this.tableRenderer = tableRenderer;
        this.stateManager = stateManager;
        // Attach event listener for window resize.
        this.setupEventListenersResize();
    }
    WindowResizeHandler.prototype.setupEventListenersResize = function () {
        var _this = this;
        window.addEventListener("resize", function () { return _this.handleResize(); });
    };
    WindowResizeHandler.prototype.handleResize = function () {
        this.debouncedUpdate();
    };
    //Debounce function to reduce the number of function calls while user is dragging the browser window.
    WindowResizeHandler.prototype.debounce = function (func, delay) {
        var timeout = null;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                func.apply(void 0, args);
            };
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, delay);
        };
    };
    WindowResizeHandler.prototype.updateAfterResize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var records, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.stateManager.adjustWindowSize();
                        return [4 /*yield*/, this.stateManager.retrieveRecords()];
                    case 1:
                        _a.sent();
                        records = this.stateManager.getRecords();
                        if (records !== null) {
                            this.tableRenderer.renderRecords(records);
                        }
                        this.paginationManager.updateButtonStates();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error in updateAfterResize: " + (error_1 instanceof Error ? error_1.message : error_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WindowResizeHandler;
}());
// Handles pagination and search functionalities for the application's table view.
var PaginationManager = /** @class */ (function () {
    /**
     * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
     * @param {StateManager} stateManager - State control for retrieving/updating application data.
     */
    function PaginationManager(tableRenderer, stateManager) {
        this.tableRenderer = tableRenderer;
        this.stateManager = stateManager;
        this.prevButton = document.getElementById("prevPage");
        this.nextButton = document.getElementById("nextPage");
        this.searchButton = document.getElementById("searchButton");
        this.mainHeading = document.getElementById("main-heading");
        this.filterInput = document.getElementById("filterInput");
        this.errorMessage = document.getElementById("errorMessage");
        // Attach event listeners for buttons and other UI elements.
        this.setupEventListeners();
    }
    // Attaches event listeners to the relevant DOM elements to handle user interactions.
    PaginationManager.prototype.setupEventListeners = function () {
        var _this = this;
        if (this.prevButton) {
            this.prevButton.addEventListener("click", function () {
                return _this.decrementPage();
            });
        }
        if (this.nextButton) {
            this.nextButton.addEventListener("click", function () {
                return _this.incrementPage();
            });
        }
        if (this.searchButton) {
            this.searchButton.addEventListener("click", function () {
                return _this.searchById();
            });
        }
        if (this.filterInput) {
            this.filterInput.addEventListener("keyup", function (event) {
                // Check if the "Enter" key was pressed
                if (event.key === "Enter") {
                    _this.searchById();
                }
            });
        }
        if (this.mainHeading) {
            this.mainHeading.addEventListener("click", function () {
                return _this.navigateToHome();
            });
        }
        if (this.filterInput && this.errorMessage) {
            this.setupLiveValidation();
        }
    };
    // Navigates to the home page by reloading the window.
    PaginationManager.prototype.navigateToHome = function () {
        try {
            window.location.reload();
        }
        catch (error) {
            console.error("Error while navigating to home: " + (error instanceof Error ? error.message : error));
            alert("Failed to reload the page. Please try again.");
        }
    };
    // Fetches the next set of records and updates the view.
    PaginationManager.prototype.incrementPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var records, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.stateManager.goToNextPage();
                        return [4 /*yield*/, this.stateManager.retrieveRecords()];
                    case 1:
                        _a.sent();
                        records = this.stateManager.getRecords();
                        if (records !== null) {
                            this.tableRenderer.renderRecords(records);
                        }
                        this.updateButtonStates();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Unexpected error in incrementPage: " + (error_2 instanceof Error ? error_2.message : error_2));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Fetches the previous set of records and updates the view.
    PaginationManager.prototype.decrementPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var records, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.stateManager.goToPreviousPage();
                        return [4 /*yield*/, this.stateManager.retrieveRecords()];
                    case 1:
                        _a.sent();
                        records = this.stateManager.getRecords();
                        if (records !== null) {
                            this.tableRenderer.renderRecords(records);
                        }
                        this.updateButtonStates();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error in decrementPage: " + (error_3 instanceof Error ? error_3.message : error_3));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Searches for a record by its ID and updates the view.
    PaginationManager.prototype.searchById = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchValue, records, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchValue = parseInt(this.filterInput.value, 10);
                        if (isNaN(searchValue)) {
                            throw new Error("Invalid search value or none");
                        }
                        this.stateManager.setHighlightedId(searchValue);
                        return [4 /*yield*/, this.stateManager.searchByIdStateChange(searchValue)];
                    case 1:
                        _a.sent();
                        records = this.stateManager.getRecords();
                        if (records !== null) {
                            this.tableRenderer.renderRecords(records, searchValue);
                        }
                        this.updateButtonStates();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error in searchById function: " + (error_4 instanceof Error ? error_4.message : error_4));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Validates input for the search bar in real-time.
    PaginationManager.prototype.setupLiveValidation = function () {
        var _this = this;
        if (!this.filterInput || !this.errorMessage) {
            console.error("Live validation setup failed: Required elements not found.");
            return;
        }
        this.filterInput.addEventListener("input", function () {
            var inputValue = _this.filterInput.value;
            if (inputValue.length === 0) {
                _this.errorMessage.textContent = "";
            }
            else if (inputValue.length < 1 ||
                inputValue.length > 6 ||
                !/^\d+$/.test(inputValue)) {
                _this.errorMessage.textContent =
                    "Invalid input. Please enter a number between 0 and 999 999.";
            }
            else {
                _this.errorMessage.textContent = "";
            }
        });
    };
    // Updates the state of the pagination buttons based on the current view.
    PaginationManager.prototype.updateButtonStates = function () {
        try {
            var from = this.stateManager.getFrom();
            var to = this.stateManager.getTo();
            var totalRecordCount = this.stateManager.getTotalRecordCount();
            this.prevButton.disabled = from === 0;
            this.nextButton.disabled = to === totalRecordCount - 1;
        }
        catch (error) {
            console.error("Unexpected error in updateButtonStates: " + (error instanceof Error ? error.message : error));
        }
    };
    return PaginationManager;
}());
//# sourceMappingURL=controllers.js.map