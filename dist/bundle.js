/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!****************!*\
  !*** ./app.js ***!
  \****************/

var ApiService = /** @class */ (function () {
    function ApiService() {
        var _this = this;
        this.url = 'http://localhost:2050';
        this.columnNames = [];
        this.numberOfRecords = 0;
        this.dataRecords = [];
        this.topRecordIndex = 0;
        if ($("#myTable")) {
            $("#myTable").append(document.createElement("table"));
            $("#myTable").css({ "position": "relative", "overflow": "hidden" });
            $("table").css({ 'table-layout': ' fixed ',
                'width': '100%',
                'font-family': 'Arial, Helvetica, sans-serif',
                'border-collapse': 'collapse',
                'top': '0',
                'bottom': '0',
                'right': '0',
                'left': '0' });
            $.get(this.url + '/columns', function (data) {
                _this.columnNames = JSON.parse(data);
                _this.populateHeaders();
            });
            $.get(this.url + '/recordCount', function (data) {
                _this.numberOfRecords = data;
            });
            this.getRecords();
            var nextButton = $('<button id="next">Next</button><br/>');
            $("body").append(nextButton);
            var previousButton = $('<button id="prev">Previous</button><br/>');
            $("body").append(previousButton);
        }
    }
    ApiService.prototype.getRecords = function () {
        var _this = this;
        $.get(this.url + '/records', {
            from: this.topRecordIndex.toString(),
            to: (this.topRecordIndex + 41).toString()
        }, function (data) {
            _this.dataRecords = JSON.parse(data);
            _this.populateRecords();
        });
    };
    ApiService.prototype.next = function () {
        if (this.topRecordIndex + 42 < this.numberOfRecords - 42) {
            this.topRecordIndex = this.topRecordIndex + 42;
            this.getRecords();
        }
    };
    ApiService.prototype.previous = function () {
        if (this.topRecordIndex - 42 >= 0) {
            this.topRecordIndex = this.topRecordIndex - 42;
            this.getRecords();
        }
    };
    ApiService.prototype.populateHeaders = function () {
        var m = this.columnNames.length;
        var tHead = document.createElement('THEAD');
        var tr = document.createElement('TR');
        for (var j = 0; j < m; j++) {
            var th = document.createElement('TH');
            th.innerText = this.columnNames[j];
            tr.appendChild(th);
        }
        tHead.appendChild(tr);
        $("th").css({ "background-color": "#04AA6D" });
        $("table").append(tHead);
    };
    ApiService.prototype.populateRecords = function () {
        var n = this.dataRecords.length;
        if ($("tbody").length == 0) {
            $("table").append(document.createElement('TBODY'));
        }
        else {
            console.log("tbody");
            $("tbody").empty();
        }
        for (var i = 0; i < n; i++) {
            var rowArr = this.dataRecords[i];
            var tr = document.createElement('TR');
            for (var j = 0; j < rowArr.length; j++) {
                var td = document.createElement('TD');
                td.innerText = rowArr[j];
                tr.appendChild(td);
            }
            $("tbody").append(tr);
        }
        $("td").css({ "border": "2px groove grey", "text-align": "center" });
        $("tr:nth-child(even)").css({ "background-color": "#04AA6D" });
    };
    return ApiService;
}());
window.onload = function () {
    $("*").css("box-sizing: border-box");
    $("body").css({ "margin": "0", "padding": "0" });
    var apiService = new ApiService();
    $("#next").on("click", function () {
        apiService.next();
    });
    $("#next").css({ "bottom": "1%", "right": "6%", "position": "absolute" });
    $("#prev").on("click", function () {
        apiService.previous();
    });
    $("#prev").css({ "bottom": "1%", "right": "11%", "position": "absolute" });
};
//# sourceMappingURL=app.js.map
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsOENBQThDO0FBQzlFLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsK0JBQStCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0EsNEJBQTRCLG1CQUFtQjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IscURBQXFEO0FBQzNFLHNDQUFzQywrQkFBK0I7QUFDckU7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0Esb0JBQW9CLCtCQUErQjtBQUNuRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wscUJBQXFCLHVEQUF1RDtBQUM1RTtBQUNBO0FBQ0EsS0FBSztBQUNMLHFCQUFxQix3REFBd0Q7QUFDN0U7QUFDQSwrQiIsInNvdXJjZXMiOlsid2VicGFjazovL29uYm9hcmQtamF2YXNjcmlwdC8uL2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBBcGlTZXJ2aWNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFwaVNlcnZpY2UoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MjA1MCc7XG4gICAgICAgIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcbiAgICAgICAgdGhpcy5udW1iZXJPZlJlY29yZHMgPSAwO1xuICAgICAgICB0aGlzLmRhdGFSZWNvcmRzID0gW107XG4gICAgICAgIHRoaXMudG9wUmVjb3JkSW5kZXggPSAwO1xuICAgICAgICBpZiAoJChcIiNteVRhYmxlXCIpKSB7XG4gICAgICAgICAgICAkKFwiI215VGFibGVcIikuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiKSk7XG4gICAgICAgICAgICAkKFwiI215VGFibGVcIikuY3NzKHsgXCJwb3NpdGlvblwiOiBcInJlbGF0aXZlXCIsIFwib3ZlcmZsb3dcIjogXCJoaWRkZW5cIiB9KTtcbiAgICAgICAgICAgICQoXCJ0YWJsZVwiKS5jc3MoeyAndGFibGUtbGF5b3V0JzogJyBmaXhlZCAnLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAnZm9udC1mYW1pbHknOiAnQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZicsXG4gICAgICAgICAgICAgICAgJ2JvcmRlci1jb2xsYXBzZSc6ICdjb2xsYXBzZScsXG4gICAgICAgICAgICAgICAgJ3RvcCc6ICcwJyxcbiAgICAgICAgICAgICAgICAnYm90dG9tJzogJzAnLFxuICAgICAgICAgICAgICAgICdyaWdodCc6ICcwJyxcbiAgICAgICAgICAgICAgICAnbGVmdCc6ICcwJyB9KTtcbiAgICAgICAgICAgICQuZ2V0KHRoaXMudXJsICsgJy9jb2x1bW5zJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5jb2x1bW5OYW1lcyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICAgICAgX3RoaXMucG9wdWxhdGVIZWFkZXJzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQuZ2V0KHRoaXMudXJsICsgJy9yZWNvcmRDb3VudCcsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubnVtYmVyT2ZSZWNvcmRzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWNvcmRzKCk7XG4gICAgICAgICAgICB2YXIgbmV4dEJ1dHRvbiA9ICQoJzxidXR0b24gaWQ9XCJuZXh0XCI+TmV4dDwvYnV0dG9uPjxici8+Jyk7XG4gICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQobmV4dEJ1dHRvbik7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNCdXR0b24gPSAkKCc8YnV0dG9uIGlkPVwicHJldlwiPlByZXZpb3VzPC9idXR0b24+PGJyLz4nKTtcbiAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChwcmV2aW91c0J1dHRvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXBpU2VydmljZS5wcm90b3R5cGUuZ2V0UmVjb3JkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgJC5nZXQodGhpcy51cmwgKyAnL3JlY29yZHMnLCB7XG4gICAgICAgICAgICBmcm9tOiB0aGlzLnRvcFJlY29yZEluZGV4LnRvU3RyaW5nKCksXG4gICAgICAgICAgICB0bzogKHRoaXMudG9wUmVjb3JkSW5kZXggKyA0MSkudG9TdHJpbmcoKVxuICAgICAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgX3RoaXMuZGF0YVJlY29yZHMgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgX3RoaXMucG9wdWxhdGVSZWNvcmRzKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQXBpU2VydmljZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudG9wUmVjb3JkSW5kZXggKyA0MiA8IHRoaXMubnVtYmVyT2ZSZWNvcmRzIC0gNDIpIHtcbiAgICAgICAgICAgIHRoaXMudG9wUmVjb3JkSW5kZXggPSB0aGlzLnRvcFJlY29yZEluZGV4ICsgNDI7XG4gICAgICAgICAgICB0aGlzLmdldFJlY29yZHMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQXBpU2VydmljZS5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvcFJlY29yZEluZGV4IC0gNDIgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy50b3BSZWNvcmRJbmRleCA9IHRoaXMudG9wUmVjb3JkSW5kZXggLSA0MjtcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVjb3JkcygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBcGlTZXJ2aWNlLnByb3RvdHlwZS5wb3B1bGF0ZUhlYWRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtID0gdGhpcy5jb2x1bW5OYW1lcy5sZW5ndGg7XG4gICAgICAgIHZhciB0SGVhZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1RIRUFEJyk7XG4gICAgICAgIHZhciB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1RSJyk7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbTsgaisrKSB7XG4gICAgICAgICAgICB2YXIgdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdUSCcpO1xuICAgICAgICAgICAgdGguaW5uZXJUZXh0ID0gdGhpcy5jb2x1bW5OYW1lc1tqXTtcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRoKTtcbiAgICAgICAgfVxuICAgICAgICB0SGVhZC5hcHBlbmRDaGlsZCh0cik7XG4gICAgICAgICQoXCJ0aFwiKS5jc3MoeyBcImJhY2tncm91bmQtY29sb3JcIjogXCIjMDRBQTZEXCIgfSk7XG4gICAgICAgICQoXCJ0YWJsZVwiKS5hcHBlbmQodEhlYWQpO1xuICAgIH07XG4gICAgQXBpU2VydmljZS5wcm90b3R5cGUucG9wdWxhdGVSZWNvcmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuZGF0YVJlY29yZHMubGVuZ3RoO1xuICAgICAgICBpZiAoJChcInRib2R5XCIpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAkKFwidGFibGVcIikuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1RCT0RZJykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0Ym9keVwiKTtcbiAgICAgICAgICAgICQoXCJ0Ym9keVwiKS5lbXB0eSgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm93QXJyID0gdGhpcy5kYXRhUmVjb3Jkc1tpXTtcbiAgICAgICAgICAgIHZhciB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1RSJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJvd0Fyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1REJyk7XG4gICAgICAgICAgICAgICAgdGQuaW5uZXJUZXh0ID0gcm93QXJyW2pdO1xuICAgICAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQoXCJ0Ym9keVwiKS5hcHBlbmQodHIpO1xuICAgICAgICB9XG4gICAgICAgICQoXCJ0ZFwiKS5jc3MoeyBcImJvcmRlclwiOiBcIjJweCBncm9vdmUgZ3JleVwiLCBcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIiB9KTtcbiAgICAgICAgJChcInRyOm50aC1jaGlsZChldmVuKVwiKS5jc3MoeyBcImJhY2tncm91bmQtY29sb3JcIjogXCIjMDRBQTZEXCIgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gQXBpU2VydmljZTtcbn0oKSk7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICQoXCIqXCIpLmNzcyhcImJveC1zaXppbmc6IGJvcmRlci1ib3hcIik7XG4gICAgJChcImJvZHlcIikuY3NzKHsgXCJtYXJnaW5cIjogXCIwXCIsIFwicGFkZGluZ1wiOiBcIjBcIiB9KTtcbiAgICB2YXIgYXBpU2VydmljZSA9IG5ldyBBcGlTZXJ2aWNlKCk7XG4gICAgJChcIiNuZXh0XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhcGlTZXJ2aWNlLm5leHQoKTtcbiAgICB9KTtcbiAgICAkKFwiI25leHRcIikuY3NzKHsgXCJib3R0b21cIjogXCIxJVwiLCBcInJpZ2h0XCI6IFwiNiVcIiwgXCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIgfSk7XG4gICAgJChcIiNwcmV2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhcGlTZXJ2aWNlLnByZXZpb3VzKCk7XG4gICAgfSk7XG4gICAgJChcIiNwcmV2XCIpLmNzcyh7IFwiYm90dG9tXCI6IFwiMSVcIiwgXCJyaWdodFwiOiBcIjExJVwiLCBcInBvc2l0aW9uXCI6IFwiYWJzb2x1dGVcIiB9KTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9