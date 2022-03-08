let state = new State();

// Fetch headers and record count
async function getData() {
	// API calls for record count and headers
	await fetch('/recordCount')
		.then(resp => {
			return resp.json();
		})
		.then(count => {
			state.RECORDCOUNT = count;
		});

	await fetch('/columns')
		.then(resp => {
			return resp.json();
		})
		.then(count => {
			state.HEADERS = count;
		});

	// Populate table with fetched data
	loadIntoTable(state.contentTable);
}

window.onload = () => {
	state.firstBtn?.setAttribute("disabled", "disabled");
	state.prevBtn?.setAttribute("disabled", "disabled");
	getData();
};

// Search entered ID
async function searchFunction() {
	let id = parseInt((<HTMLInputElement>state.inputBox).value);
	let numRecords = state.RECORDCOUNT - 1;

	if (id < 0 || id > numRecords || isNaN(id)) {
		// User info: Display error message
		state.pageInfo!.innerHTML = `<p>No records to display</p>`;
	} else {
		// Use entered ID to calculate what records should display
		if ((state.RECORDCOUNT - 1) - id >= state.getRecords()) {
			state.setTrimStart(id);
			state.setTrimEnd(state.getTrimStart() + (state.getRecords() - 1));
		} else {
			state.setTrimEnd(state.RECORDCOUNT - 1);
			state.setTrimStart(state.getTrimEnd() - state.getRecords() + 1);
		}
		loadIntoTable(state.contentTable);
	}
	(<HTMLInputElement>state.inputBox).value = 'Enter ID number';
}

// TODO fix add rows
// Add rows to table
async function addRows(this: any, start: number, end: number, isAppend: boolean) {
	// let newTableBody = document.createElement("tbody");
	// let reversedTableBody = document.createElement("tbody");
	let link = "/records?from=" + start + "&to=" + end;
	let data = await fetch(link)
		.then(resp => resp.json());

	for (let row of data) {
		let rowElement = document.createElement("tr");
		state.setCountRec(state.getCountRec() + 1);

		for (let cellText of row) {
			let cellElement = document.createElement("td");

			cellElement.textContent = cellText;
			rowElement.appendChild(cellElement); // Append cells
		}

		if (isAppend) {
			state.tableBody!.appendChild(rowElement);// Append rows
		} else {

			state.tableBody!.prepend(rowElement);

		}
	}

	// let rows = newTableBody!.rows;
	// if (isAppend) {
	// 	this.tableBody.parentNode.replaceChild(newTableBody, this.tableBody)// Append rows
	// }
	// else {
	// 	for (let i = rows.length - 1; i >= 0; i--) {
	// 		reversedTableBody!.appendChild(rows[i]); // Prepend rows
	// 	}
	// 	contentTable!.prepend(reversedTableBody);

	// }

}

// Delete rows from table
async function deleteRows(newHeight: number, diff: number) {
	let num = newHeight - 1;

	for (let i = num; i > (num + diff); i--) {
		state.tableBody!.deleteRow(i);
	}
}

// Load json data into table function
async function loadIntoTable(table: any) {

	// Display loader
	$(".content").fadeOut(200);
	$(".loader").fadeIn(200);

	// UI "Aesthetic": update buttons
	state.firstBtn?.removeAttribute("disabled");
	state.prevBtn?.removeAttribute("disabled");
	state.nextBtn?.removeAttribute("disabled");
	state.lastBtn?.removeAttribute("disabled");

	if (state.getTrimEnd() == state.RECORDCOUNT - 1) {
		state.lastBtn?.setAttribute("disabled", "disabled");
		state.nextBtn?.setAttribute("disabled", "disabled");
	}

	if (state.getTrimStart() == 0) {
		state.firstBtn?.setAttribute("disabled", "disabled");
		state.prevBtn?.setAttribute("disabled", "disabled");
	}

	state.pageInfo!.innerHTML = `<p></p>`;

	// Clear the table
	state.tableHead!.innerHTML = "<tr></tr>";
	state.tableBody!.innerHTML = "";

	// Populate the headers
	for (let headerText of state.HEADERS) {
		let headerElement = document.createElement("th");

		headerElement.textContent = headerText;
		state.tableHead!.querySelector("tr")!.appendChild(headerElement);
	}

	// Add only records that must be displayed on table
	state.setCountRec(0);
	addRows(state.getTrimStart(), state.getTrimEnd(), true);

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
state.firstBtn!.addEventListener("click", debounce(() => {
	state.setTrimStart(0);
	state.setTrimEnd(state.getTrimStart() + state.getRecords() - 1);
	loadIntoTable(state.contentTable);
}, 800)
);

// Set trim to previous data
state.prevBtn!.addEventListener("click", debounce(() => {
	// If previous page is end of data && there are not enough records to fill window
	if ((state.getTrimStart() - 1) - (state.getRecords() - 1) < 0) {
		state.setTrimStart(0);
		state.setTrimEnd(state.getTrimStart() + state.getRecords() - 1);
	} else {
		state.setTrimEnd(state.getTrimStart() - 1);
		state.setTrimStart(state.getTrimEnd() - state.getRecords() + 1);
	}
	loadIntoTable(state.contentTable);
}, 800)
);

// Set trim to next data
state.nextBtn!.addEventListener("click", debounce(() => {
	// If next page is end of data && there are not enough records to fill window
	if ((state.RECORDCOUNT - 1) - (state.getTrimEnd() + 1) < state.getRecords()) {
		state.setTrimEnd(state.RECORDCOUNT - 1);
		state.setTrimStart(state.getTrimEnd() - state.getRecords() + 1);
	} else {
		state.setTrimStart(state.getTrimEnd() + 1);
		state.setTrimEnd(state.getTrimStart() + state.getRecords() - 1);
	}
	loadIntoTable(state.contentTable);
}, 800)
);

// Set trim to end of data
state.lastBtn!.addEventListener("click", debounce(() => {
	state.setTrimEnd(state.RECORDCOUNT - 1);
	state.setTrimStart(state.getTrimEnd() - state.getRecords() + 1);
	loadIntoTable(state.contentTable);
}, 800)
);

// Add/remove rows from table based on resize event of the window
window.addEventListener("resize", debounce(async () => {

	// Calculate number rows to be added/deleted
	let newHeight = Math.floor((window.innerHeight - 160) / 40);
	let diff = newHeight - state.getRecords();

	let start = state.getTrimEnd() + 1;
	let end = state.getTrimEnd() + diff;


	if (diff < 0) {
		// Delete rows from last page
		deleteRows(state.getCountRec(), diff);

		state.setCountRec(state.getCountRec() + diff);
		state.setTrimEnd(state.getTrimEnd() + diff);
	}
	else if (diff > 0 && state.getTrimEnd() == state.RECORDCOUNT - 1) {
		// Prepend rows as last page gets bigger
		end = state.getTrimStart() - 1;
		start = state.getTrimStart() - diff;

		await addRows(start, end, false);

		state.setTrimStart(state.getTrimStart() - diff);
	}
	else if (diff > 0 && end >= state.RECORDCOUNT) {
		let addEnd = (state.RECORDCOUNT - 1) - state.getTrimEnd();
		end = state.RECORDCOUNT - 1;
		start = end - addEnd + 1;
		addRows(start, end, true);

		let addTop = diff - addEnd;
		end = state.getTrimStart() - 1;
		start = state.getTrimStart() - addTop;

		await addRows(start, end, false);

		state.setTrimEnd(state.RECORDCOUNT - 1);
		state.setTrimStart(state.getTrimStart() - addTop)
	}
	else if (diff > 0 && start <= state.RECORDCOUNT - 1) {
		// Add rows if end of data is not yet reached
		addRows(start, end, true);

		state.setTrimEnd(state.getTrimEnd() + diff)
	}
	state.setRecords(newHeight);

	// UI "Aesthetic": update buttons
	state.firstBtn?.removeAttribute("disabled");
	state.prevBtn?.removeAttribute("disabled");
	state.nextBtn?.removeAttribute("disabled");
	state.lastBtn?.removeAttribute("disabled");

	if (state.getTrimEnd() == state.RECORDCOUNT - 1) {
		state.lastBtn?.setAttribute("disabled", "disabled");
		state.nextBtn?.setAttribute("disabled", "disabled");
	}

	if (state.getTrimStart() == 0) {
		state.firstBtn?.setAttribute("disabled", "disabled");
		state.prevBtn?.setAttribute("disabled", "disabled");
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
