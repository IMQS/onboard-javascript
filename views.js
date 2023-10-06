"use strict";
//*** Views ***/
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
/**
 * TableRenderer is responsible for rendering data into an HTML table.
 * It fetches data from the StateManager and populates the table accordingly.
 */
var TableRenderer = /** @class */ (function () {
    function TableRenderer(stateManager) {
        this.stateManager = stateManager;
    }
    /**
     * Renders the initial table layout including column names and initial data set.
     * @param {StateManager} stateManager - The manager to fetch state from.
     */
    TableRenderer.prototype.initialRender = function () {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, records, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        columnNames = this.stateManager.getColumnNames();
                        if (columnNames !== null) {
                            this.renderColumnNames(columnNames);
                        }
                        return [4 /*yield*/, this.stateManager.retrieveRecords()];
                    case 1:
                        _a.sent();
                        records = this.stateManager.getRecords();
                        if (records !== null) {
                            this.renderRecords(records);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error during initialRender: " + error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TableRenderer.prototype.renderColumnNames = function (columnNames) {
        try {
            var thead = document.querySelector("thead");
            if (thead === null) {
                throw new Error("Table header not found.");
            }
            var row = document.createElement("tr");
            for (var _i = 0, columnNames_1 = columnNames; _i < columnNames_1.length; _i++) {
                var columnName = columnNames_1[_i];
                var cell = document.createElement("th");
                cell.textContent = columnName;
                row.appendChild(cell);
            }
            thead.appendChild(row);
            this.setColumnWidths();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("An error occurred: " + error.message);
            }
            else {
                console.error("An unknown error occurred: " + error);
            }
        }
    };
    /** Sets the widths of table columns evenly. */
    TableRenderer.prototype.setColumnWidths = function () {
        try {
            var table = document.getElementById("myTable");
            if (!table) {
                throw new Error('Table with id "myTable" not found.');
            }
            var headerCells = table.querySelectorAll("th");
            var numCols = headerCells.length;
            var colWidth_1 = 100 / numCols;
            headerCells.forEach(function (headerCell) {
                headerCell.style.width = colWidth_1 + "%";
            });
        }
        catch (error) {
            console.error("Error setting column widths: " + error);
        }
    };
    //Populates the table body with records. Optionally highlights a specified row if searched.
    TableRenderer.prototype.renderRecords = function (records, highlightId) {
        if (highlightId === void 0) { highlightId = null; }
        // Use the state's highlightedId if no highlightId is provided.
        highlightId = highlightId !== null && highlightId !== void 0 ? highlightId : this.stateManager.getHighlightedId();
        try {
            if (records === null) {
                throw new Error("No records to render.");
            }
            var tbody_1 = document.querySelector("tbody");
            if (tbody_1 === null) {
                throw new Error("Table body not found.");
            }
            tbody_1.innerHTML = "";
            records.forEach(function (record) {
                var row = document.createElement("tr");
                if (highlightId !== null &&
                    record.length > 0 &&
                    parseInt(record[0].toString(), 10) === highlightId) {
                    row.classList.add("highlight");
                }
                record.forEach(function (cell) {
                    var td = document.createElement("td");
                    td.textContent = cell.toString();
                    row.appendChild(td);
                });
                tbody_1.appendChild(row);
            });
        }
        catch (error) {
            console.error("An error occurred: " + error);
        }
    };
    return TableRenderer;
}());
//# sourceMappingURL=views.js.map