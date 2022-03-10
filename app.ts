let state = new State();
let el = new docElement();

// Fetch headers and record count
async function getData(): Promise<void> {
	// API calls for record count and headers
	await fetch('/recordCount')
		.then(resp => {
			if (resp.ok) {
				return resp.json();
			}
			throw new Error('Could not retrieve data');
		})
		.then(count => {
			state.setRecordCount(count);
		})
		.catch((error) => {
			console.log(error);
		});

	await fetch('/columns')
		.then(resp => {
			if (resp.ok) {
				return resp.json();
			}
			throw new Error('Could not retrieve data');
		})
		.then(count => {
			state.setHeaders(count);
		})
		.catch((error) => {
			console.log(error);
		});

	// Populate table with fetched data
	loadIntoTable();
	// TODO: Add return statement
}

window.onload = async () => {
	await getData();
	console.log(state.getRecordCount())
};

// Add rows to table
async function addRows(this: any, start: number, end: number, isAppend: boolean) {

	let link = "/records?from=" + start + "&to=" + end;
	await fetch(link)
		.then(resp => {
			if (resp.ok) {
				return resp.json();
			}
			throw new Error('Could not retrieve data');
		})
		.then(count => {
			state.data = count;
		})
		.catch((error) => {
			console.log(error);
		});

	// Append or prepend rows to table
	if (isAppend) {
		for (let row of state.data) {
			let rowElement = document.createElement("tr");

			for (let cellText of row) {
				let cellElement = document.createElement("td");

				cellElement.textContent = cellText;
				rowElement.appendChild(cellElement); // Append cells
			}
			el.tableBody!.appendChild(rowElement);// Append rows
		}
	} else {
		// Reverse order of data and save in temp variable
		let rowData: any;
		rowData = [];
		let k = 0;
		for (let i = state.data.length - 1; i >= 0; i--) {
			rowData[k] = state.data[i];
			k++;
		}

		// Use temp variable to append rows to table in correct order
		for (let row of rowData) {
			let rowElement = document.createElement("tr");

			for (let cellText of row) {
				let cellElement = document.createElement("td");

				cellElement.textContent = cellText;
				rowElement.appendChild(cellElement); // Append cells
			}
			el.tableBody!.prepend(rowElement);// Prepend rows
		}
	}
	el.contentTable!.appendChild(el.tableBody!);
}

// Delete rows from table
function deleteRows(newHeight: number, diff: number) {
	let num = newHeight - 1;

	for (let i = num; i > (num + diff); i--) {
		el.tableBody!.deleteRow(i);
	}
}

// Load json data into table function
function loadIntoTable() {

	// Display loader
	$(".content").fadeOut(200);
	$(".loader").fadeIn(200);

	// UI "Aesthetic": update buttons
	el.firstBtn?.removeAttribute("disabled");
	el.prevBtn?.removeAttribute("disabled");
	el.nextBtn?.removeAttribute("disabled");
	el.lastBtn?.removeAttribute("disabled");

	if (state.trimEnd == state.getRecordCount() - 1) {
		el.lastBtn?.setAttribute("disabled", "disabled");
		el.nextBtn?.setAttribute("disabled", "disabled");
	}

	if (state.trimStart == 0) {
		el.firstBtn?.setAttribute("disabled", "disabled");
		el.prevBtn?.setAttribute("disabled", "disabled");
	}

	el.pageInfo!.innerHTML = `<p></p>`;

	// Clear the table
	el.tableHead!.innerHTML = "";
	el.tableBody!.innerHTML = "";
	el.reversedTableBody!.innerHTML = "";

	let headerRow = document.createElement("tr");

	// Populate the headers
	for (let headerText of state.getHeaders()) {
		let headerElement = document.createElement("th");

		headerElement.textContent = headerText;
		headerRow.appendChild(headerElement);
	}

	el.tableHead!.appendChild(headerRow)

	// Add only records that must be displayed on table
	addRows(state.trimStart, state.trimEnd, true);

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

// Search entered ID
el.searchBtn!.addEventListener("click", debounce(() => {
	let id = parseInt((<HTMLInputElement>el.inputBox).value);
	let numRecords = state.getRecordCount() - 1;

	if (id < 0 || id > numRecords || isNaN(id)) {
		// User info: Display error message
		el.pageInfo!.innerHTML = `<p>No records to display</p>`;
	} else {
		// Use entered ID to calculate what records should display
		if ((state.getRecordCount() - 1) - id >= state.records) {
			state.trimStart = id;
			state.trimEnd = state.trimStart + (state.records - 1);
		} else {
			state.trimEnd = state.getRecordCount() - 1;
			state.trimStart = state.trimEnd - state.records + 1;
		}
		loadIntoTable();
	}
	(<HTMLInputElement>el.inputBox).value = 'Enter ID number';
}, 300));

// Set trim to start of data
el.firstBtn!.addEventListener("click", debounce(() => {
	state.trimStart = 0;
	state.trimEnd = state.trimStart + state.records - 1;
	loadIntoTable();
}, 300));

// Set trim to previous data
el.prevBtn!.addEventListener("click", debounce(() => {
	// If previous page is end of data && there are not enough records to fill window
	if ((state.trimStart - 1) - (state.records - 1) < 0) {
		state.trimStart = 0;
		state.trimEnd = state.trimStart + state.records - 1;
	} else {
		state.trimEnd = state.trimStart - 1;
		state.trimStart = state.trimEnd - state.records + 1;
	}
	loadIntoTable();
}, 300));

// Set trim to next data
el.nextBtn!.addEventListener("click", debounce(() => {
	// If next page is end of data && there are not enough records to fill window
	if ((state.getRecordCount() - 1) - (state.trimEnd + 1) < state.records) {
		state.trimEnd = state.getRecordCount() - 1;
		state.trimStart = state.trimEnd - state.records + 1;
	} else {
		state.trimStart = state.trimEnd + 1;
		state.trimEnd = state.trimStart + state.records - 1;
	}
	loadIntoTable();
}, 300));

// Set trim to end of data
el.lastBtn!.addEventListener("click", debounce(() => {
	state.trimEnd = state.getRecordCount() - 1;
	state.trimStart = state.trimEnd - state.records + 1;
	loadIntoTable();
}, 300));

// Add/remove rows from table based on resize event of the window
window.addEventListener("resize", debounce(async () => {

	// Calculate number rows to be added/deleted
	// The calculation is an estimate of how many space there is for rows (160 is estimate space for header and footer of website)
	let newHeight = Math.floor((window.innerHeight - 160) / 40);
	let diff = newHeight - state.records;

	let start = state.trimEnd + 1;
	let end = state.trimEnd + diff;

	if (diff < 0) {
		// Delete rows from last page
		deleteRows(state.records, diff);

		state.trimEnd = state.trimEnd + diff;
	} else if (diff > 0 && state.trimEnd == state.getRecordCount() - 1) {
		// Prepend rows as last page gets bigger
		// 'start' and 'end' only fetches the amount that should be prepended
		end = state.trimStart - 1;
		start = state.trimStart - diff;

		await addRows(start, end, false);

		state.trimStart = state.trimStart - diff;
	} else if (diff > 0 && end >= state.getRecordCount()) {
		// Appends remaining records until RECORDCOUNT - 1,
		// then prepends the rest
		let addEnd = (state.getRecordCount() - 1) - state.trimEnd;
		end = state.getRecordCount() - 1;
		start = end - addEnd + 1;
		addRows(start, end, true);

		let addTop = diff - addEnd;
		end = state.trimStart - 1;
		start = state.trimStart - addTop;

		await addRows(start, end, false);

		state.trimEnd = state.getRecordCount() - 1;
		state.trimStart = state.trimStart - addTop
	} else if (diff > 0 && start <= state.getRecordCount() - 1) {
		// Add rows if end of data is not yet reached
		addRows(start, end, true);

		state.trimEnd = state.trimEnd + diff
	}
	state.records = newHeight;

	// UI "Aesthetic": update buttons
	el.firstBtn?.removeAttribute("disabled");
	el.prevBtn?.removeAttribute("disabled");
	el.nextBtn?.removeAttribute("disabled");
	el.lastBtn?.removeAttribute("disabled");

	if (state.trimEnd == state.getRecordCount() - 1) {
		el.lastBtn?.setAttribute("disabled", "disabled");
		el.nextBtn?.setAttribute("disabled", "disabled");
	}

	if (state.trimStart == 0) {
		el.firstBtn?.setAttribute("disabled", "disabled");
		el.prevBtn?.setAttribute("disabled", "disabled");
	}
}, 100)); // Log window dimensions at most every 100ms














//  o   o
//               /^^^^^7
// '  '     ,oO))))))))Oo,
//        ,'))))))))))))))), /{
//   '  ,'o  ))))))))))))))))={
//      >    ))))))))))))))))={
//      `,   ))))))\ \)))))))={
//        ',))))))))\/)))))' \{
//          '*O))))))))O*'
