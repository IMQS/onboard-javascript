
let records = Math.floor((window.innerHeight - 160) / 40); // Estimate of available table space
let trimStart: number;
let trimEnd: number;
let countRec: number;
let isAppend: boolean;

// Variables fetched once with load of window
let RECORDCOUNT: number;
let HEADERS: string[];

// Global document elements
let contentTable: HTMLElement | null;
let tableBody: HTMLTableSectionElement | null;
let pageInfo: HTMLElement | null;
let firstBtn: HTMLElement | null;
let prevBtn: HTMLElement | null;
let nextBtn: HTMLElement | null;
let lastBtn: HTMLElement | null;
let tableHead: HTMLElement | null;
let inputBox: HTMLElement | null;



// Fetch headers and record count
async function getData() {
	// API calls for record count and headers
	RECORDCOUNT = await fetch('/recordCount')
		.then(resp => resp.json());
	HEADERS = await fetch('/columns')
		.then(resp => resp.json());

	// Populate table with fetched data
	loadIntoTable(contentTable);
}


// TODO Pierre's changes
// Search entered ID
async function searchFunction() {
	let idString = $('#id-search').val()
	let id = Number($('#id-search').val());
	let numRecords = RECORDCOUNT - 1;


	if (id < 0 || id > numRecords || Number.isNaN(id) || idString == "") {
		// User info: Display error message
		pageInfo!.innerHTML = `<p>No records to display</p>`;
	}
	else {
		// Use entered ID to calculate what records should display
		if ((RECORDCOUNT - 1) - id >= records) {
			trimStart = id;
			trimEnd = trimStart + (records - 1);
		}
		else {
			trimEnd = RECORDCOUNT - 1;
			trimStart = trimEnd - records + 1;
		}
		loadIntoTable(contentTable);
	}
	(<HTMLInputElement>inputBox).value = '';
}


// Add rows to table
async function addRows(link: string) {
	let data = await fetch(link)
		.then(resp => resp.json());

	for (let row of data) {
		let rowElement = document.createElement("tr");
		countRec += 1;

		for (let cellText of row) {
			let cellElement = document.createElement("td");

			cellElement.textContent = cellText;
			rowElement.appendChild(cellElement); // Append cells
		}
		if (isAppend) {
			tableBody!.appendChild(rowElement); // Append rows
		}
		else {
			tableBody?.prepend(rowElement); /**Prepend rows*/
		}

	}
}


// Delete rows from table
async function deleteRows(newHeight: number, diff: number) {
	let num = newHeight - 1;

	for (let i = num; i > (num + diff); i--) {
		tableBody!.deleteRow(i);
	}
}


// Load json data into table function
async function loadIntoTable(table: any) {

	// Display loader
	$(".content").fadeOut(200);
	$(".loader").fadeIn(200);

	// UI "Aesthetic": update buttons
	firstBtn?.removeAttribute("disabled");
	prevBtn?.removeAttribute("disabled");
	nextBtn?.removeAttribute("disabled");
	lastBtn?.removeAttribute("disabled");

	if (trimEnd == RECORDCOUNT - 1) {
		lastBtn?.setAttribute("disabled", "disabled");
		nextBtn?.setAttribute("disabled", "disabled");
	}

	if (trimStart == 0) {
		firstBtn?.setAttribute("disabled", "disabled");
		prevBtn?.setAttribute("disabled", "disabled");
	}

	pageInfo!.innerHTML = `<p></p>`;

	// Clear the table
	tableHead!.innerHTML = "<tr></tr>";
	tableBody!.innerHTML = "";

	// Populate the headers
	for (let headerText of HEADERS) {
		let headerElement = document.createElement("th");

		headerElement.textContent = headerText;
		tableHead!.querySelector("tr")!.appendChild(headerElement);
	}

	// Fetch only records that must be displayed on table
	let recordsLink = "/records?from=" + trimStart + "&to=" + trimEnd;

	countRec = 0;
	isAppend = true;
	addRows(recordsLink);

	// Display content
	$(".loader").fadeOut(200);
	$(".content").fadeIn(200);
}


// TODO Divide function into onclick events
// Calculate what data should be fetch when page buttons are clicked
function pageFunction(btnName: string) {
	let isValid = false

	// Set trim to start of data
	if (btnName == "first" && trimStart != 0) {
		isValid = true;
		trimStart = 0;
		trimEnd = trimStart + records - 1;
	}

	// Set trim to previous data
	if (btnName == "prev" && trimStart != 0) {
		// If previous page is end of data && there are not enough records to fill window
		if ((trimStart - 1) - (records - 1) < 0) {
			trimStart = 0;
			trimEnd = trimStart + records - 1;
		}
		else {
			trimEnd = trimStart - 1;
			trimStart = trimEnd - records + 1;
		}
		isValid = true;

	}

	// Set trim to next data
	if (btnName == "next" && trimEnd != RECORDCOUNT - 1) {
		// If next page is end of data && there are not enough records to fill window
		if ((RECORDCOUNT - 1) - (trimEnd + 1) < records) {
			trimEnd = RECORDCOUNT - 1;
			trimStart = trimEnd - records + 1;
		}
		else {
			trimStart = trimEnd + 1;
			trimEnd = trimStart + records - 1;
		}
		isValid = true;
	}

	// Set trim to end of data
	if (btnName == "last" && trimEnd != RECORDCOUNT - 1) {
		isValid = true;
		trimEnd = RECORDCOUNT - 1;
		trimStart = trimEnd - records + 1;
	}

	if (isValid) {
		loadIntoTable(contentTable);
	}
	else {
		console.log("Grey out");
	}

}


// Code is only triggered once per user input
const debounce = (fn: Function, ms: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};


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
const clickFirst = debounce(() => inputFirst(), 800);
const clickPrev = debounce(() => inputPrev(), 800);
const clickNext = debounce(() => inputNext(), 800);
const clickLast = debounce(() => inputLast(), 800);


// Add/remove rows from table based on resize event of the window
window.addEventListener("resize", debounce(async () => {
	isAppend = false;

	// Calculate number rows to be added/deleted
	let newHeight = Math.floor((window.innerHeight - 160) / 40);
	let diff = newHeight - records;

	let start = trimEnd + 1;
	let end = trimEnd + diff;


	if (diff < 0) {
		// Delete rows from last page
		deleteRows(countRec, diff);

		countRec = countRec + diff;
		trimEnd = trimEnd + diff;
		records = newHeight;
	}
	else if (diff > 0 && trimEnd == RECORDCOUNT - 1) {
		// Prepend rows as last page gets bigger
		let timeoutId: ReturnType<typeof setTimeout>;

		end = trimStart - 1;
		start = trimStart - diff;
		isAppend = false;

		for (let i = end; i >= start; i--) {
			let recordsLink = "/records?from=" + i + "&to=" + i;
			await addRows(recordsLink);
		}


		trimStart = trimStart - diff;
		records = newHeight;

	}
	else if (diff > 0 && end >= RECORDCOUNT) {
		let addEnd = (RECORDCOUNT - 1) - trimEnd;
		end = RECORDCOUNT - 1;
		start = end - addEnd + 1;
		isAppend = true;
		let recordsLink = "/records?from=" + start + "&to=" + end;
		addRows(recordsLink);

		let addTop = diff - addEnd;
		end = trimStart - 1;
		start = trimStart - addTop;
		isAppend = false;

		for (let i = end; i >= start; i--) {
			let recordsLink = "/records?from=" + i + "&to=" + i;
			await addRows(recordsLink);
		}

		trimEnd = RECORDCOUNT - 1;
		trimStart = trimStart - addTop;
		records = newHeight;
	}
	else if (diff > 0 && start <= RECORDCOUNT - 1) {
		// Add rows if end of data is not yet reached
		isAppend = true;
		let recordsLink = "/records?from=" + start + "&to=" + end;
		addRows(recordsLink);

		trimEnd = trimEnd + diff;
		records = newHeight;
	}
	else {
		records = newHeight;
	}

	// UI "Aesthetic": update buttons
	firstBtn?.removeAttribute("disabled");
	prevBtn?.removeAttribute("disabled");
	nextBtn?.removeAttribute("disabled");
	lastBtn?.removeAttribute("disabled");

	if (trimEnd == RECORDCOUNT - 1) {
		lastBtn?.setAttribute("disabled", "disabled");
		nextBtn?.setAttribute("disabled", "disabled");
	}

	if (trimStart == 0) {
		firstBtn?.setAttribute("disabled", "disabled");
		prevBtn?.setAttribute("disabled", "disabled");
	}
}, 100)
); // Log window dimensions at most every 100ms


window.onload = () => {
	trimStart = 0
	trimEnd = trimStart + records - 1;

	firstBtn?.setAttribute("disabled", "disabled");
	prevBtn?.setAttribute("disabled", "disabled");

	// Get document elements when page loads
	contentTable = document.getElementById('content-table');
	tableBody = contentTable!.querySelector("tbody");
	tableHead = document.getElementById("content-thead");
	pageInfo = document.getElementById('page-number');
	firstBtn = document.getElementById('first');
	prevBtn = document.getElementById('prev');
	nextBtn = document.getElementById('next');
	lastBtn = document.getElementById('last');
	inputBox = document.getElementById('id-search');
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
