
let state = {
	'records': Math.floor((window.innerHeight - 160) / 40), // Estimate of available table space
	'trimStart': 0,
	'trimEnd': 10,
	'countRec': 0
}


// These are 'technically' constants
let RECORDCOUNT = 350;
let HEADERS = ["ID", "City", "Population"];

// 'Global' get element 
function el(element: string) {
	return document.getElementById(element);
}


// Fetch headers and record count
async function getData() {
	// API calls for record count and headers
	RECORDCOUNT = await (await fetch('/recordCount')).json();
	HEADERS = await (await fetch('/columns')).json();

	// Populate table with fetched data
	loadIntoTable(el('content-table'));
}


// Search entered ID
async function searchFunction() {
	let id = Number($('#id-search').val());
	let pageInfo = el('page-number');
	let numRecords = RECORDCOUNT;

	pageInfo!.innerHTML = `<p></p>`;

	if (id < 0 || id > numRecords || Number.isNaN(id)) {
		// User info: Display error message
		pageInfo!.innerHTML = `<p>No records to display</p>`;
	}
	else {
		// Use entered ID to calculate what page it is on
		if ((RECORDCOUNT - 1) - id >= state.records) {
			state.trimStart = id;
			state.trimEnd = state.trimStart + (state.records - 1);
		}
		else {
			state.trimEnd = RECORDCOUNT - 1;
			state.trimStart = state.trimEnd - state.records + 1;
		}
		loadIntoTable(el("table"));
	}
}


// Add rows to table
async function addRows(link: string) {
	let table = el("content-table");
	let tableBody = table?.querySelector("tbody");
	let data = await (await fetch(link)).json();
	for (let row of data) {
		let rowElement = document.createElement("tr");
		state.countRec += 1;

		for (let cellText of row) {
			let cellElement = document.createElement("td");

			cellElement.textContent = cellText;
			rowElement.appendChild(cellElement); // Append cells
		}
		tableBody?.appendChild(rowElement); // Append rows
	}
}


// Prepend rows to table
async function prependRows(link: string) {
	let table = el("content-table");
	let tableBody = table?.querySelector("tbody");
	let data = await (await fetch(link)).json();
	for (let row of data) {
		let rowElement = document.createElement("tr");
		state.countRec += 1;

		for (let cellText of row) {
			let cellElement = document.createElement("td");

			cellElement.textContent = cellText;
			rowElement.appendChild(cellElement);
		}
		tableBody?.prepend(rowElement); // Prepend rows
	}
}


// Delete rows from table
async function deleteRows(newHeight: number, diff: number) {
	let table = el("content-table");
	let tableBody = table?.querySelector("tbody");
	let num = newHeight - 1

	for (let i = num; i > (num + diff); i--) {
		tableBody!.deleteRow(i);
	}
}


// Load json data into table function
async function loadIntoTable(table: any) {

	// Display loader
	$(".content").fadeOut(500);
	$(".loader").fadeIn(500);

	// UI "Aesthetic": update buttons
	el('first')?.removeAttribute("disabled");
	el('prev')?.removeAttribute("disabled");
	el('next')?.removeAttribute("disabled");
	el('last')?.removeAttribute("disabled");

	if (state.trimEnd == RECORDCOUNT - 1) {
		el('last')?.setAttribute("disabled", "disabled");
		el('next')?.setAttribute("disabled", "disabled");
	}

	if (state.trimStart == 0) {
		el('first')?.setAttribute("disabled", "disabled");
		el('prev')?.setAttribute("disabled", "disabled");
	}

	// Select table elements to populate
	let tableHead = el("content-thead");
	let tableBody = el("content-tbody");

	let hearders = HEADERS;

	// Clear the table
	tableHead!.innerHTML = "<tr></tr>";
	tableBody!.innerHTML = "";

	// Populate the headers
	for (let headerText of hearders) {
		let headerElement = document.createElement("th");

		headerElement.textContent = headerText;
		tableHead!.querySelector("tr")!.appendChild(headerElement);
	}

	// Fetch only records that must be displayed on table
	let recordsLink = "/records?from=" + state.trimStart + "&to=" + state.trimEnd;

	state.countRec = 0;
	addRows(recordsLink);

	// Display content
	$(".loader").fadeOut(500);
	$(".content").fadeIn(500);
}


// Code is only triggered once per user input
const debounce = (fn: Function, ms = 300) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};


// Calculate what data should be fetch when page buttons are clicked
function pageFunction(btnName: string) {
	let isValid = false

	// Set trim to start of data
	if (btnName == "first" && state.trimStart != 0) {
		isValid = true;
		state.trimStart = 0;
		state.trimEnd = state.trimStart + state.records - 1;
	}

	// Set trim to previous data
	if (btnName == "prev" && state.trimStart != 0) {
		// If previous page is end of data && there are not enough records to fill window
		if ((state.trimStart - 1) - (state.records - 1) < 0) {
			state.trimStart = 0;
			state.trimEnd = state.trimStart + state.records - 1;
		}
		else {
			state.trimEnd = state.trimStart - 1;
			state.trimStart = state.trimEnd - state.records + 1;
		}
		isValid = true;

	}

	// Set trim to next data
	if (btnName == "next" && state.trimEnd != RECORDCOUNT - 1) {
		// If next page is end of data && there are not enough records to fill window
		if ((RECORDCOUNT - 1) - (state.trimEnd + 1) < state.records) {
			state.trimEnd = RECORDCOUNT - 1;
			state.trimStart = state.trimEnd - state.records + 1;
		}
		else {
			state.trimStart = state.trimEnd + 1;
			state.trimEnd = state.trimStart + state.records - 1;
		}
		isValid = true;
	}

	// Set trim to end of data
	if (btnName == "last" && state.trimEnd != RECORDCOUNT - 1) {
		isValid = true;
		state.trimEnd = RECORDCOUNT - 1;
		state.trimStart = state.trimEnd - state.records + 1;
	}

	if (isValid) {
		loadIntoTable(el("table"));
	}
	else {
		console.log("Grey out");
	}
}


// Last resort debounce application for buttons
function inputFirst() {
	pageFunction('first');
}
function inputPrev() {
	pageFunction('prev');
}
function inputNext() {
	pageFunction('next');
}
function inputLast() {
	pageFunction('last');
}
const clickFirst = debounce(() => inputFirst(), 600);
const clickPrev = debounce(() => inputPrev(), 600);
const clickNext = debounce(() => inputNext(), 600);
const clickLast = debounce(() => inputLast(), 600);


// Add/remove rows from table based on resize event of the window
window.addEventListener("resize", debounce(() => {

	// Calculate number rows to be added/deleted
	let newHeight = Math.floor((window.innerHeight - 160) / 40);
	let diff = newHeight - state.records;

	let start = state.trimEnd + 1;
	let end = state.trimEnd + diff;


	if (diff < 0) {
		// Delete rows from last page
		deleteRows(state.countRec, diff);

		state.countRec = state.countRec + diff;
		state.trimEnd = state.trimEnd + diff;
		state.records = newHeight;
	}
	else if (diff > 0 && state.trimEnd == RECORDCOUNT - 1) {
		// Prepend rows as last page gets bigger
		end = state.trimStart - 1;
		start = state.trimStart - diff;


		for (let i = end; i >= start; i--) {
			let recordsLink = "/records?from=" + i + "&to=" + i;
			prependRows(recordsLink);
		}


		state.trimStart = state.trimStart + diff;
		state.records = newHeight;

	}
	else if (diff > 0 && end >= RECORDCOUNT) {
		let addEnd = (RECORDCOUNT - 1) - state.trimEnd;
		end = RECORDCOUNT - 1;
		start = end - addEnd + 1;
		let recordsLink = "/records?from=" + start + "&to=" + end;
		addRows(recordsLink);
		console.log("Start ", start, " and end ", end);

		let addTop = diff - addEnd;
		end = state.trimStart - 1;
		start = state.trimStart - addTop;

		for (let i = end; i >= start; i--) {
			let recordsLink = "/records?from=" + i + "&to=" + i;
			prependRows(recordsLink);
		}
		console.log("Start ", start, " and end ", end);

		state.trimEnd = RECORDCOUNT - 1;
		state.trimStart = state.trimEnd - (newHeight - 1)
		state.records = newHeight;
	}
	else if (diff > 0 && start <= RECORDCOUNT - 1) {
		// Add rows if end of data is not yet reached
		let recordsLink = "/records?from=" + start + "&to=" + end;
		addRows(recordsLink);

		state.trimEnd = state.trimEnd + diff;
		state.records = newHeight;
	}
	else {
		state.records = newHeight;
	}

	// UI "Aesthetic": update buttons
	el('first')?.removeAttribute("disabled");
	el('prev')?.removeAttribute("disabled");
	el('next')?.removeAttribute("disabled");
	el('last')?.removeAttribute("disabled");

	if (state.trimEnd == RECORDCOUNT - 1) {
		el('last')?.setAttribute("disabled", "disabled");
		el('next')?.setAttribute("disabled", "disabled");
	}

	if (state.trimStart == 0) {
		el('first')?.setAttribute("disabled", "disabled");
		el('prev')?.setAttribute("disabled", "disabled");
	}
}, 100)
); // Log window dimensions at most every 100ms


window.onload = () => {
	state.trimStart = 0
	state.trimEnd = state.trimStart + state.records - 1;
	el('first')?.setAttribute("disabled", "disabled");
	el('prev')?.setAttribute("disabled", "disabled");
	getData();
}












//  o   o
//               /^^^^^7
// '  '     ,oO))))))))Oo,
//        ,'))))))))))))))), /{
//   '  ,'o  ))))))))))))))))={
//      >    ))))))))))))))))={
//      `,   ))))))\ \)))))))={
//        ',))))))))\/)))))' \{
//          '*O))))))))O*'
