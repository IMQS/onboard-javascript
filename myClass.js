"use strict";
var Myclass = /** @class */ (function () {
    function Myclass() {
        this.firstNumber = 0;
        this.lastNumber = 0;
        this.backend = "http://localhost:2050";
        this.resizeTimeout = 0;
    }
    /** fetches the number of records from backend */
    Myclass.prototype.fetchRecordCount = function () {
        return fetch(this.backend + "/recordCount")
            .then(function (res) {
            if (!res.ok) {
                throw 'Failed to fetch record count';
            }
            return res.json();
        })
            .catch(function (err) {
            throw 'Error fetching the record count: ' + err;
        });
    };
    /** fetches columns from backend */
    Myclass.prototype.fetchColumns = function () {
        return fetch(this.backend + "/columns")
            .then(function (res) {
            if (!res.ok) {
                throw 'Failed to fetch columns';
            }
            return res.json();
        })
            .catch(function (err) {
            throw 'Error fetching columns' + err;
        });
    };
    /** fetches records from backend */
    Myclass.prototype.fetchRecords = function (from, to) {
        return fetch(this.backend + "/records?from=" + from + "&to=" + to)
            .then(function (res) {
            if (!res.ok) {
                throw "Sorry, there's a problem with the network";
            }
            return res.json();
        })
            .catch(function (err) {
            throw 'Error fetching records from server ' + err;
        });
    };
    return Myclass;
}());
//# sourceMappingURL=myClass.js.map