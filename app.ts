/// <reference path="Scripts\typings\jquery\jquery.d.ts" />

var maxEntries;	        // How many rows should we fit on a page
var curIndex = 0;		// Current index of data displayed in table

window.onload = () => {
    createColumns();	// Retrieve and create Column names
    NumofRows();
	populateTable();	// Load initial data on page
};

// Run this function when window resizes
function NumofRows() {
    var height = $(window).height();
    maxEntries = Math.round((height-40) / 34);
    populateTable();
}

window.onresize = NumofRows;

//  Browse lower index
var scrollUp = function () {
	$("#scrollLeft").off();	// Disable button until routine completion
	curIndex -= maxEntries;
	if (curIndex < 0) {	// Lower limit protection
		curIndex = 0;
	}
	populateTable();
}

//	Browse higher index
var scrollDown = function () {
	$("#scrollRight").off();
    $.getJSON("/recordCount", function (numRecords) {	// Upper limit protection
        if ((curIndex + 2 * maxEntries) > (numRecords - 1)) {
            curIndex = numRecords - 1 - maxEntries;
        } else {
            curIndex += maxEntries;
        }
        populateTable();
    })
        .fail(function () {
            alert("Cannot connect to server!");
        });
}

//	Populate Table given current Index
var populateTable = function () {
    $.getJSON("/records?from=" + curIndex + "&to=" + (curIndex + maxEntries), function (data) {
        $("#MainTable tbody").empty();
        for (var i = 0; i < data.length; i++) {
            insertDataRow(data[i]);
        }
    })
        .fail(function () {
            alert("Cannot connect to server!");
        });
	$("#currentIndex").html(curIndex + " - " + (curIndex + maxEntries));	// Display current index
	$("#scrollLeft").off().on('click', scrollUp);	// Bind buttons to navbar, only after data insertion
	$("#scrollRight").off().on('click', scrollDown);
}

//	Create Table columns
var createColumns = function () {
    $.getJSON("/columns", function (data) {
        var colHeadings = "<tr>";
        for (var i = 0; i < data.length; i++) {
            colHeadings += "<th>" + data[i] + "</th>";
        }
        colHeadings += "</tr>";
        $("#MainTable thead").append(colHeadings);
    })
        .fail(function () {
            alert("Cannot connect to server!");
        })
};

//	Append single datarow
var insertDataRow = function (rowData) {
	var buildRow = "<tr>";
	for (var i = 0; i < rowData.length; i++) {
		buildRow += "<td>" + rowData[i] + "</td>";
	}
	buildRow += "</tr>";
	$("#MainTable tbody").append(buildRow);
}
