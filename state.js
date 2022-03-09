"use strict";
var State = /** @class */ (function () {
    function State() {
        this.records = this.calculateRecords();
        this.trimStart = 0;
        this.trimEnd = this.records - 1;
        this.countRec = 0;
        this.RECORDCOUNT = 350;
        this.HEADERS = ["ID", "City", "Population"];
        this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];
    }
    State.prototype.getTrimStart = function () {
        return this.trimStart;
    };
    State.prototype.getTrimEnd = function () {
        return this.trimEnd;
    };
    State.prototype.setTrimStart = function (value) {
        this.trimStart = value;
    };
    State.prototype.setTrimEnd = function (value) {
        this.trimEnd = value;
    };
    State.prototype.calculateRecords = function () {
        return Math.floor((window.innerHeight - 160) / 40); // Estimate of available table space
    };
    return State;
}());
//# sourceMappingURL=state.js.map