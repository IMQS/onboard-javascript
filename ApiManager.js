"use strict";
var ApiManager = /** @class */ (function () {
    function ApiManager(mainUrl) {
        this.mainUrl = mainUrl;
    }
    ApiManager.prototype.fetchJson = function (mainUrl) {
        return fetch(mainUrl)
            .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            else {
                throw new Error("HTTP error! Status: " + res.status);
            }
        })
            .catch(function (error) {
            throw new Error("Fetch failed: " + error);
        });
    };
    /** Retrieves records from the api */
    ApiManager.prototype.getRecords = function (fromID, toID) {
        return this.fetchJson(this.mainUrl + "records?from=" + fromID + "&to=" + toID);
    };
    /** Retrieves columns from the api */
    ApiManager.prototype.getColumns = function () {
        return this.fetchJson(this.mainUrl + "columns");
    };
    /** Retrieves the number of records there are */
    ApiManager.prototype.getRecordCount = function () {
        return this.fetchJson(this.mainUrl + "recordCount");
    };
    return ApiManager;
}());
//# sourceMappingURL=ApiManager.js.map