var ApiManager = /** @class */ (function () {
    function ApiManager(mainUrl) {
        this.mainUrl = mainUrl;
    }
    ApiManager.prototype.fetchJson = function (mainUrl) {
        return fetch(mainUrl)
            .then(function (res) { return res.text(); })
            .then(function (data) { return JSON.parse(data); })
            .catch(function (err) {
            throw err;
        });
    };
    // This function  will handle retrieving the records from the api
    ApiManager.prototype.getRecords = function (fromID, toID) {
        return this.fetchJson(this.mainUrl + "records?from=" + fromID + "&to=" + toID);
    };
    // This function  will handle retrieving the columns from the api
    ApiManager.prototype.getColumns = function () {
        return this.fetchJson(this.mainUrl + "columns");
    };
    // This function  will handle retrieving the record count from the api
    ApiManager.prototype.getRecordCount = function () {
        return this.fetchJson(this.mainUrl + "recordCount");
    };
    return ApiManager;
}());
export { ApiManager };
//# sourceMappingURL=apiManager.js.map