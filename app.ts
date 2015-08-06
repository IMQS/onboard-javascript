class SetupTable {
	constructor(element: HTMLTableElement) {
		this.tableElement = element;
		this.rowsUsed = 0;
	}

	setRecordCount(count: number) {
		this.recordCount = count;
	}

	getRecordCount() {
		return this.recordCount;
	}

	getColumnCount() {
		return this.headerDataLength - 1;
	}

	// Create the main header row
	createHeadRow(data) {
		var headerData = JSON.parse(data);
		this.headerDataLength = headerData.length;

		var tr = document.createElement('tr');
		for (var i: number = 0; i < this.headerDataLength - 1; i++) {
			var th = document.createElement('th');
			var text = document.createTextNode(headerData[i]);
			th.appendChild(text);
			tr.appendChild(th);
		}

		this.tableElement.appendChild(tr);
	}

	// Create a new row from the data provided
	createRow(data) {
		var rowData = JSON.parse(data)[0]; // Parse the JSON data, will be only one row

		var tr = document.createElement('tr');
		for (var i: number = 0; i < this.headerDataLength - 1; i++) {
			var th = document.createElement('td');
			var text = document.createTextNode(rowData[i]);
			th.appendChild(text);
			tr.appendChild(th);
		}

		this.rowsUsed++; // Update the amount of rows used in the current page, this is used when clearing the table
		this.tableElement.appendChild(tr);
	}

	// Clear all of the table rows except for the first row containing the column headers
	clearTable() {
		// Remove the rows one for one from the bottom row
		while (this.rowsUsed > 0) {
			this.tableElement.deleteRow(this.rowsUsed--);
		}
	}

	private tableElement: HTMLTableElement;
	private headerDataLength: number; // Save how many headers have been used
	private recordCount: number;
	private rowsUsed: number; // Keeps track of how many rows are being used, this is crucial when clearing the table to load a new page
}

// Load the rows with the page number required
function loadDataRows(page: number) {
	var emptyString: string;

	// Calculate how many lines can be shown on the page depending on the height of the page, the header and the rows
	var docHeight: number = $(window).height();
	var rowHeight: number = $('th').height() + parseInt($('th').css("border-top")) + parseInt($('th').css("border-bottom"));
	var headerHeight: number = $('h1').height();

	// If the rowHeight or HeaderHeight is null then fix the amount of rows to 10, this prevents the page from trying to access the entire database at once
	if (rowHeight == null || headerHeight == null)
		var maxLines: number = 10;
	else
		var maxLines: number = Math.floor((docHeight - headerHeight) / rowHeight) - 6; // TODO: calculate the 6 value more accurately

	// Determine whether the lines are going to be more than the amount of records remaining in the database
	if ((page + 1) * maxLines > tablehandle.getRecordCount() / tablehandle.getColumnCount())
		var bottomRecord = tablehandle.getRecordCount() / tablehandle.getColumnCount();
	else
		var bottomRecord = (page + 1) * maxLines;

	// Get the records for the current page from the database and update the rows in the table
	for (var count: number = (page * maxLines); count < bottomRecord; count++) {
		$.get("records?from=" + count + "&to=" + (count + 1), emptyString, function (data, textStatus, XHR) {
			tablehandle.createRow(data);
		}.bind(this));
	}

	// Update the line below the table indicating which records are being shown
	var rowText = <HTMLParagraphElement> document.getElementById("rowText");
	var text = document.createTextNode("Showing records " + (page * maxLines + 1) + " to " + (bottomRecord) + ".");

	// Remove the previous text if it is showing
	if (oldRowTextChild != null)
		rowText.removeChild(oldRowTextChild);

	// Replace the global variable containing the previous child
	oldRowTextChild = text;
	rowText.appendChild(text);

	// Update the next page button state depending whether there are any pages left to display or not
	if (bottomRecord < (page + 1) * maxLines) {
		var buttonNext = <HTMLInputElement> document.getElementById("buttonNext");
		buttonNext.disabled = true;
	}
	else {
		var buttonNext = <HTMLInputElement> document.getElementById("buttonNext");
		buttonNext.disabled = false;
	}

	// Update the previous page button state depending whether there are any pages left to display or not
	if (currentPage == 0) {
		var buttonPrev = <HTMLInputElement> document.getElementById("buttonPrev");
		buttonPrev.disabled = true;
	}
	else {
		var buttonPrev = <HTMLInputElement> document.getElementById("buttonPrev");
		buttonPrev.disabled = false;
	}
}

// This function handles the onClick event for the Next page button
function onClickNext() {
	tablehandle.clearTable();
	loadDataRows(++currentPage);
}

// This function handles the onClick event for the Previous page button
function onClickPrev() {
	tablehandle.clearTable();
	loadDataRows(--currentPage);
}

// Global variables to be used by the onClick events
var tablehandle;
var currentPage: number;
var oldRowTextChild;
$(document).ready(function () {
	var emptyString: string;
	currentPage = 0;

	var mainTableHandle = <HTMLTableElement> document.getElementById("maintable");
	tablehandle = new SetupTable(mainTableHandle);

	// Set the jQuery calls to run synchronous with this script
	jQuery.ajaxSetup({ async: false });

	// Get the amount of records in the database
	$.get("recordCount", emptyString, function (data, textStatus, XHR) {
		tablehandle.setRecordCount(data);
	}.bind(this));
	
	// Load the table header row
	$.get("columns", emptyString, function (data, textStatus, XHR) {
		tablehandle.createHeadRow(data);
	}.bind(this));

	// Load the first table page at document startup
	loadDataRows(currentPage);
});