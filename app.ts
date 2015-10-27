/* Onboard-javascript project for Roan Brand */

namespace onboard {
	let nrDisplayedEntries;			// How many rows should we fit on a page
	let curIndex = 0;				// Current index of data displayed in table
	let recCountTotal;				// Total number of records
	let resizeTimer;				// Used to debounce/delay window resize event

	window.onload = () => {
		$.getJSON("/recordCount", function (count) {
			recCountTotal = count;
			createColumns();		// Retrieve and create Column names
			NumofRows();
		}).fail(function () {
			alert("Cannot connect to server!");
		});
	};

	// Run this function when window resizes
	function NumofRows() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			let availableHeight = $("body").height() - $("#navigator").height();
			$("#MainTable").height(availableHeight)
			nrDisplayedEntries = Math.floor(availableHeight / 30);
			populateTable();
		}, 200);
	}

	window.onresize = NumofRows;

	//  Browse lower index
	function scrollUp() {
		$("#scrollLeft").off();		// Disable button until routine completion
		curIndex -= nrDisplayedEntries;
		if (curIndex < 0) {			// Lower limit protection
			curIndex = 0;
		}
		populateTable();
	}

	//	Browse higher index
	function scrollDown() {
		$("#scrollRight").off();
		if ((curIndex + 2 * nrDisplayedEntries) > (recCountTotal - 1)) {
			curIndex = recCountTotal - 1 - nrDisplayedEntries;
		} else {
			curIndex += nrDisplayedEntries;
		}
		populateTable();
	}

	//	Populate Table given current Index
	function populateTable() {
		let topIndex = curIndex + nrDisplayedEntries - 1;
		if (topIndex <= curIndex) topIndex = curIndex + 1;
		$.getJSON("/records?from=" + curIndex + "&to=" + topIndex, function (data) {
			$("#MainTable tbody").empty();
			for (let i = 0; i < data.length; i++) {
				insertDataRow(data[i]);
			}
		});
		$("#currentIndex").html(curIndex + ' - ' + topIndex);	// Display current index
		$("#scrollLeft").off().on('click', scrollUp);	// Bind buttons to navbar, only after data insertion
		$("#scrollRight").off().on('click', scrollDown);
	}

	//	Create Table columns
	function createColumns() {
		$.getJSON("/columns", function (data) {
			let colHeadings = "<tr>";
			for (let i = 0; i < data.length; i++) {
				colHeadings += `<th>${data[i]}</th>`;
			}
			colHeadings += "</tr>";
			$("#MainTable thead").append(colHeadings);
		})
			.fail(function () {
				alert("Cannot connect to server!");
			})
	};

	//	Append single datarow
	function insertDataRow(rowData) {
		let buildRow = "<tr>";
		for (let i = 0; i < rowData.length; i++) {
			buildRow += `<td>${rowData[i]}</td>`;
		}
		buildRow += "</tr>";
		$("#MainTable tbody").append(buildRow);
	}
}