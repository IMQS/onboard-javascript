"use strict";
var State = /** @class */ (function () {
    function State() {
        this.contentTable = document.getElementById('content-table');
        this.tableBody = document.querySelector('tbody');
        this.tableHead = document.getElementById("content-thead");
        this.pageInfo = document.getElementById('page-info');
        this.firstBtn = document.getElementById('first');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.lastBtn = document.getElementById('last');
        this.inputBox = document.getElementById('id-search');
        this.RECORDCOUNT = 350;
        this.HEADERS = ["ID", "City", "Population"];
        this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];
        this.records = this.calculateRecords();
        this.trimStart = 0;
        this.trimEnd = this.records - 1;
        this.countRec = 0;
    }
    State.prototype.getRecords = function () {
        return this.records;
    };
    State.prototype.getTrimStart = function () {
        return this.trimStart;
    };
    State.prototype.getTrimEnd = function () {
        return this.trimEnd;
    };
    State.prototype.getCountRec = function () {
        return this.countRec;
    };
    State.prototype.setRecords = function (value) {
        this.records = value;
    };
    State.prototype.setTrimStart = function (value) {
        this.trimStart = value;
    };
    State.prototype.setTrimEnd = function (value) {
        this.trimEnd = value;
    };
    State.prototype.setCountRec = function (value) {
        this.countRec = value;
    };
    State.prototype.calculateRecords = function () {
        return Math.floor((window.innerHeight - 160) / 40); // Estimate of available table space
    };
    return State;
}());
//# sourceMappingURL=state.js.map