
let records = Math.floor((window.innerHeight - 160) / 40); // Estimate of available table space
let trimStart: number;
let trimEnd: number;
let countRec: number;
let isAppend: boolean;

// Variables fetched once with load of window
let RECORDCOUNT: number;
let HEADERS: string[];

// Global document elements
let contentTable: HTMLElement | null = document.getElementById('content-table');
let tableBody: HTMLTableSectionElement | null = contentTable!.querySelector("tbody");
let tableHead: HTMLElement | null = document.getElementById("content-thead");
let pageInfo: HTMLElement | null = document.getElementById('page-info');
let firstBtn: HTMLElement | null = document.getElementById('first');
let prevBtn: HTMLElement | null = document.getElementById('prev');
let nextBtn: HTMLElement | null = document.getElementById('next');
let lastBtn: HTMLElement | null = document.getElementById('last');
let inputBox: HTMLElement | null = document.getElementById('id-search');


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


window.onload = () => {
	trimStart = 0
	trimEnd = trimStart + records - 1;

	firstBtn?.setAttribute("disabled", "disabled");
	prevBtn?.setAttribute("disabled", "disabled");

	getData();
}


// Search entered ID
async function searchFunction() {
	let id = parseInt((<HTMLInputElement>inputBox).value);
	let numRecords = RECORDCOUNT - 1;

	if (id < 0 || id > numRecords || isNaN(id)) {
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
	(<HTMLInputElement>inputBox).value = 'Enter ID number';
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
			tableBody!.prepend(rowElement); /**Prepend rows*/
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

// Code is only triggered once per user input
const debounce = (fn: Function, ms: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};


// Set trim to start of data
firstBtn!.addEventListener("click", debounce(() => {
	trimStart = 0;
	trimEnd = trimStart + records - 1;
	loadIntoTable(contentTable);
}, 800)
);


// Set trim to previous data
prevBtn!.addEventListener("click", debounce(() => {
	// If previous page is end of data && there are not enough records to fill window
	if ((trimStart - 1) - (records - 1) < 0) {
		trimStart = 0;
		trimEnd = trimStart + records - 1;
	}
	else {
		trimEnd = trimStart - 1;
		trimStart = trimEnd - records + 1;
	}
	loadIntoTable(contentTable);
}, 800)
);


// Set trim to next data
nextBtn!.addEventListener("click", debounce(() => {
	// If next page is end of data && there are not enough records to fill window
	if ((RECORDCOUNT - 1) - (trimEnd + 1) < records) {
		trimEnd = RECORDCOUNT - 1;
		trimStart = trimEnd - records + 1;
	}
	else {
		trimStart = trimEnd + 1;
		trimEnd = trimStart + records - 1;
	}
	loadIntoTable(contentTable);
}, 800)
);


// Set trim to end of data
lastBtn!.addEventListener("click", debounce(() => {
	trimEnd = RECORDCOUNT - 1;
	trimStart = trimEnd - records + 1;
	loadIntoTable(contentTable);
}, 800)
);


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














//  o   o
//               /^^^^^7
// '  '     ,oO))))))))Oo,
//        ,'))))))))))))))), /{
//   '  ,'o  ))))))))))))))))={
//      >    ))))))))))))))))={
//      `,   ))))))\ \)))))))={
//        ',))))))))\/)))))' \{
//          '*O))))))))O*'
