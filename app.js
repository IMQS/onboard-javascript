var OnboardingGrid = (function () {
    function OnboardingGrid(element) {
        this.mainDiv = element;
        this.headingDiv = document.getElementById('headings');
        this.hostString = "http://localhost:2050/";
        this.recCnt = 0;
        this.pageSize = 35;
        this.pageBegin = 0;
        this.pageEnd = this.pageBegin + this.pageSize;
        this.getRecordCount();
        this.getColumnHeaders();
    }
    OnboardingGrid.prototype.start = function () {
        this.addDOMElements();
    };
    OnboardingGrid.prototype.addDOMElements = function () {
        $('#headings').empty();
        var header1;
        header1 = document.createElement('h1');
        header1.innerHTML += "Grid for onboarding...";
        this.headingDiv.appendChild(header1);
        this.headingDiv.innerHTML += "Record Count: " + this.recCnt;
        this.getAllData();
    };
    OnboardingGrid.prototype.getRecordCount = function () {
        var getURL;
        var self = this;
        getURL = self.hostString + "recordCount";
        $.ajax({
            url: getURL,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (records) {
                self.recCnt = records;
            },
            error: function (msg) {
                alert("Error: " + msg);
            }
        });
    };
    OnboardingGrid.prototype.getColumnHeaders = function () {
        var getURL;
        var self = this;
        getURL = self.hostString + "columns";
        $.ajax({
            url: getURL,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: function (columns) {
                var headers = "";
                $.each(columns, function (key, value) {
                    headers += "<th>" + value + "</th>";
                });
                $('#tableHead').append(headers);
            },
            error: function (msg) {
                alert("Error: " + msg);
            }
        });
    };
    OnboardingGrid.prototype.getAllData = function () {
        var getURL;
        var self = this;
        getURL = self.hostString + "records?from=" + self.pageBegin + "&to=" + self.pageEnd;
        $.ajax({
            url: getURL,
            type: 'GET',
            dataType: 'json',
            success: function (rows) {
                var row;
                $.each(rows, function (key, rowItem) {
                    row = "";
                    row += "<tr>";
                    $.each(rowItem, function (key, columnItem) {
                        row += "<td>" + columnItem + "</td>";
                    });
                    row += "</tr>";
                    $('#tableBody').append(row);
                });
            },
            error: function (msg) {
                alert("Error: " + msg);
            }
        });
    };
    OnboardingGrid.prototype.nextPage = function () {
        var self = this;
        if (!((self.pageBegin + self.pageSize) >= (self.recCnt - self.pageSize)))
            self.pageBegin += self.pageSize;
        else
            self.pageBegin = self.recCnt - self.pageSize;
        if (!((self.pageEnd + self.pageSize) >= (self.recCnt - 1)))
            self.pageEnd += self.pageSize;
        else
            self.pageEnd = (self.recCnt - 1);
        self.refresh();
    };
    OnboardingGrid.prototype.previousPage = function () {
        var self = this;
        if (!((self.pageBegin - self.pageSize) <= 0))
            self.pageBegin -= self.pageSize;
        else
            self.pageBegin = 0;
        if (!((self.pageEnd - self.pageSize) <= self.pageSize))
            self.pageEnd -= self.pageSize;
        else
            self.pageEnd = self.pageSize;
        self.refresh();
    };
    OnboardingGrid.prototype.beginPage = function () {
        var self = this;
        self.pageBegin = 0;
        self.pageEnd = self.pageSize;
        self.refresh();
    };
    OnboardingGrid.prototype.endPage = function () {
        var self = this;
        self.pageBegin = self.recCnt - self.pageSize;
        self.pageEnd = (self.recCnt - 1);
        self.refresh();
    };
    OnboardingGrid.prototype.refresh = function () {
        $('#tableBody').empty();
        this.addDOMElements();
    };
    return OnboardingGrid;
})();
window.onload = function () {
    var divEl = document.getElementById('content');
    var grid = new OnboardingGrid(divEl);
    document.getElementById('nextBtn').onclick = function () { grid.nextPage(); };
    document.getElementById('previousBtn').onclick = function () { grid.previousPage(); };
    document.getElementById('beginBtn').onclick = function () { grid.beginPage(); };
    document.getElementById('endBtn').onclick = function () { grid.endPage(); };
    grid.start();
};
//# sourceMappingURL=app.js.map