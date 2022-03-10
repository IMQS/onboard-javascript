"use strict";
var State = /** @class */ (function () {
    function State() {
        this.records = this.calculateRecords();
        this.trimStart = 0;
        this.trimEnd = this.records - 1;
        this.isDefaultNode = true;
        // Default values for variables that stores server data
        this.RECORDCOUNT = 350;
        this.HEADERS = ["ID", "City", "Population"];
        this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];
    }
    State.prototype.getRecordCount = function () {
        return this.RECORDCOUNT;
    };
    State.prototype.getHeaders = function () {
        return this.HEADERS;
    };
    State.prototype.setRecordCount = function (value) {
        this.RECORDCOUNT = value;
    };
    State.prototype.setHeaders = function (value) {
        this.HEADERS = value;
    };
    State.prototype.calculateRecords = function () {
        // Estimate of available table space
        // The calculation is an estimate of how many space there is for rows (160 is estimate space for header and footer of website)
        return Math.floor((window.innerHeight - 160) / 40);
    };
    return State;
}());
//# sourceMappingURL=state.js.map