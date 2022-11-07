let firstIndex: number, lastIndex: number; // stores the indices of the first and last rows in the table
let recordCount: number; // stores the number of records in the database
let table, columns, thead, tbody, headRow; // stores column headers
let resizeTimer; // stores time since last window resize

// builds the grid table from the column headers and row data
function buildTable(rows) {

	// initialise table
	table = document.createElement("table");
	table.className = "gridtable";
	thead = document.createElement("thead");
	tbody = document.createElement("tbody");
	headRow = document.createElement("tr");

	// build column headers
	for (const header of columns) {
		let th = document.createElement("th");
		th.appendChild(document.createTextNode(header));
		headRow.appendChild(th);
	};
	thead.appendChild(headRow);
	table.appendChild(thead);

	// create rows
	for (const el of rows) {
		let tr = document.createElement("tr");
		for (let o in el) {
			let td = document.createElement("td");
			td.appendChild(document.createTextNode(el[o]))
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);

	// builds footer elements (buttons, search field)
	document.getElementById("footer").innerHTML = `<a onclick="goPrevious()">&laquo;</a>
	<a onclick="goNext()">&raquo;</a>
	<input type="text" id="search" onkeyup="search(event)" placeholder="Enter ID...">`;

	document.getElementById("loader").remove();

	return table;
}

// filters rows by user input ID
function search(e) {
	let input = $("#search").val().toString();
	let $table = $("tbody tr").toArray();

	for (const record of $table) {
		let td = record.getElementsByTagName("td")[0];
		record.style.display = "block";
		if (td) {
			let val = td.innerText || td.textContent;
			record.style.display = val.indexOf(input) > -1 ? "" : "none";
		}
	}

	// if record doesn't exist on current page, query database and display results
	if (e.which == 13) {
		loadPage(parseInt(input));
	}
}

// load the previous page
function goPrevious() {
	let numRows = calculateRows();
	if (lastIndex >= numRows) {
		loadPage(firstIndex - numRows);
	}
}

// load the next page
function goNext() {
	if (lastIndex < recordCount - 1) {
		loadPage(lastIndex + 1);
	}
}

// loads the columns and rows to be displayed based on index of the first row
function loadPage(start: number) {
	firstIndex = start;
	lastIndex = calculateRows();

	// clear table
	document.getElementById("content").innerHTML = "";
	document.getElementById("footer").innerHTML = "";

	// check bounds
	if (firstIndex < 0) firstIndex = 0;
	if (lastIndex >= recordCount) lastIndex = recordCount - 1;
	if (firstIndex >= recordCount) {
		firstIndex = recordCount - calculateRows();
	}

	// create loader
	let loader = document.createElement("loader");
	document.getElementById("content").appendChild(loader);
	loader.innerHTML = `<div class="loader" id="loader"></div>`;

	// inner function to fetch rows from server and invoke table build function
	$.get("http://localhost:2050/records?from=" + firstIndex + "&to=" + lastIndex, function (rows) {
		document.getElementById("content").appendChild(buildTable(JSON.parse(rows)));
	});
}

// determines the number of rows to display based on the window height
function calculateRows() {
	let x = (window.innerHeight - document.getElementById("footer").offsetHeight - document.getElementById("tableHeading").offsetHeight - 64) / 37;
	return Math.floor(x);
}

window.onload = function () {
	// hide browser scroll bar
	document.body.style.overflow = "hidden";

	// get record count
	$.get("http://localhost:2050/recordCount", function (numRecords) {

		// get column headers from server
		$.get("http://localhost:2050/columns", function (cols) {
			columns = JSON.parse(cols);

			// load the first page
			loadPage(0);
			recordCount = JSON.parse(numRecords);
		});
	});
}

// updates the table display when the window is resized
// debounce function to reduce frequency of queries made
window.onresize = () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function () {
		loadPage(firstIndex);
	}, 250);
}
