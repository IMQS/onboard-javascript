﻿// Onboarding Project - 2018

let RECORD_COUNT: number; // total number of records available in webserver
let resizeTimer; // delay required to reduce the number of calls made by browser when resizing the window
let CONTROLS_HEIGHT;
let CONTENT_HEIGHT;
let columnsString; // variable to store columns text from api call
let recordsText; // variable to store records from api call
let columnsArray;

// makes api call and returns data
function getRecordCount() {
	const apiCall = new XMLHttpRequest();

	apiCall.onreadystatechange = function () {
		if (apiCall.readyState === 4 && apiCall.status === 200) {
			RECORD_COUNT = JSON.parse(apiCall.response);

			if (columnsString !== undefined) {
				tableElement.generateTable();
			}
		}
	}
	apiCall.open("GET", "http://localhost:2050/recordCount", true);
	apiCall.send();
}

function getCols() {
	const apiCall = new XMLHttpRequest();
	apiCall.onreadystatechange = function () {
		if (apiCall.readyState === 4 && apiCall.status === 200) {
			columnsString = apiCall.response;
			columnsArray = parseText(columnsString);
			if (RECORD_COUNT !== undefined) {
				tableElement.generateTable();
			}
		}
	}
	apiCall.open("GET", "http://localhost:2050/columns", true);
	apiCall.send();
}

function getTable(start: number, end: number, tableElement) {
	const apiCall = new XMLHttpRequest();

	const loadDiv = document.createElement('div');
	loadDiv.setAttribute('class', 'loader')
	tableElement.myTable.parentNode.appendChild(loadDiv);

	apiCall.onreadystatechange = function () {
		if (apiCall.readyState === 4 && apiCall.status === 200) {
			tableElement.myTable.parentNode.removeChild(tableElement.myTable.parentNode.lastChild)
			recordsText = apiCall.response;

			const recordsTable = parseText(recordsText);

			for (const iEntry of recordsTable) {

				const tr = document.createElement('tr');
				tableElement.myTable.appendChild(tr);

				for (const jEntry of iEntry) {

					const td = document.createElement('td');
					td.appendChild(document.createTextNode(" " + jEntry));
					tr.appendChild(td);
				}
			}
		}
	}
	apiCall.open("GET", "http://localhost:2050/records?from=" + start + "&to=" + end, true);
	apiCall.send();
}

// converts strings into array and table
function parseText(textString: string) {
	textString = textString.replace(/'/g, '""');
	const outputArray = JSON.parse(textString);
	return outputArray;
}

class tableGenerator {
	element: HTMLElement;
	myTable: HTMLElement;
	firstRecord: number;
	endRecord: number;

	constructor(element: HTMLElement, firstRecord: number = 0) {
		this.element = element;
		this.firstRecord = firstRecord;
		this.myTable = document.createElement('table');
		this.element.appendChild(this.myTable);
	}

	generateTable() {

		if (this.firstRecord >= RECORD_COUNT || this.firstRecord < 0) {
			// make sure first record is set with in proper limits 
			this.firstRecord = this.firstRecord < 0 ? 0 : this.firstRecord;
			this.firstRecord = this.firstRecord > RECORD_COUNT - 1 ? RECORD_COUNT - 1 : this.firstRecord;
			alert('please select a number between 0 and ' + (RECORD_COUNT - 1));
			return;
		}

		this.myTable.innerHTML = ''; // empty table div to fill in a new table

		// get table height based on  remaining window size after buttons
		CONTENT_HEIGHT = (window.innerHeight - CONTROLS_HEIGHT);
		this.myTable.setAttribute("height", "CONTENT_HEIGHT");

		// calculate row number based on table header + row heights + borders in CSS and ensure its never less than 1
		let numRows: number = Math.floor((CONTENT_HEIGHT - CONTROLS_HEIGHT - 26) / 46);
		numRows = numRows <= 0 ? 1 : numRows;

		// set number of records to get from server and ensure that the last record doesnt exceed the limit.
		this.endRecord = this.firstRecord - 1 + numRows;
		this.endRecord = (this.endRecord >= RECORD_COUNT ? RECORD_COUNT - 1 : this.endRecord);

		// write html for table header
		for (const i of columnsArray) {
			const th = document.createElement('th');
			this.myTable.appendChild(th);

			th.appendChild(document.createTextNode(" " + i));
		}
		getTable(this.firstRecord, this.endRecord, this);
	}

	// function used by the next page buttton, requires the last entry from previously generated table
	nextPage() {

		this.firstRecord = this.endRecord + 1;
		this.firstRecord = this.firstRecord > RECORD_COUNT - 1 ? RECORD_COUNT - 1 : this.firstRecord;
		// getTable(this.firstRecord, this.endRecord, this);
		this.generateTable();
	}

	firstPage() {
		this.firstRecord = 0;
		// getTable(this.firstRecord, this.endRecord, this);
		this.generateTable();
	}

	// function used by the next page buttton, requires the first and last entry from previously generated table
	prevPage() {
		// if the new first entry is less than zero, take user to the first page 
		this.firstRecord = this.firstRecord - (this.endRecord - this.firstRecord) - 1;
		this.firstRecord = this.firstRecord < 0 ? 0 : this.firstRecord;
		// getTable(this.firstRecord, this.endRecord, this);
		this.generateTable();
	}
}

// hint for the user
function helpFunc() {
	alert(
		"Table for viewing records with IDs 0 to" + (RECORD_COUNT - 1) + " (Numbers Only)."
		+ "\nTo start from a specific record enter a record ID and click 'Go To'.");
}

let customPage = () => {
	let inputVal = parseInt(this.recordNum.value);
	if (isNaN(inputVal)) {
		alert('Please type in a number')
		return;
	}
	tableElement.firstRecord = inputVal;
	tableElement.generateTable();
}

window.onresize = () => {
	const doneResizing = () => {
		tableElement.generateTable();
	}

	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(doneResizing, 500);
}

let contentsDiv2: HTMLElement;
let tableElement: tableGenerator;

// load page for the first time and create buttons
window.onload = () => {

	// get columns and record coun,asynch
	getRecordCount();
	getCols();

	const controlsDiv = this.controls;
	CONTROLS_HEIGHT = controlsDiv.offsetHeight;

	// html for buttons and input text fields
	controlsDiv.innerHTML += `
 		<button onclick = "tableElement.firstPage()">First Page</button>
		<button onclick = "tableElement.prevPage()" > Prev </button>
		<button onclick = "tableElement.nextPage()" > Next </button>
		<button onclick = "customPage()"> Go To </button>
		<input value = "record..." id = "recordNum" >
		<button onclick = "helpFunc()" > Help </button>`;

	// initialise the table's parent div, create a tableElement
	contentsDiv2 = document.getElementById('content');
	tableElement = new tableGenerator(contentsDiv2);
}
