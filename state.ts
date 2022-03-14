// Code is only triggered once per user input
const debounce = (fn: Function, ms: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

class State {
	// Variables to determine how many records there should be on the screen (records)
	// and where these records should start and end (trimStart and trimEnd) > (display record 15 to 25)
	records: number;
	trimStart: number;
	trimEnd: number;

	// Variables for server data
	private RECORDCOUNT: number;
	private HEADERS: string[];
	data: any[];

	// Variables for DOM elements
	contentTable: HTMLElement | null;
	tableBody: HTMLTableSectionElement | null;
	tableHead: HTMLElement | null;
	pageInfo: HTMLElement | null;
	searchBtn: HTMLElement | null;
	firstBtn: HTMLElement | null;
	prevBtn: HTMLElement | null;
	nextBtn: HTMLElement | null;
	lastBtn: HTMLElement | null;
	inputBox: HTMLElement | null;

	constructor() {
		// Starting values for when page is first loaded
		this.records = this.calculateRecords();
		this.trimStart = 0;
		this.trimEnd = this.records - 1;

		// Default values for server data variables
		this.RECORDCOUNT = 350;
		this.HEADERS = ["ID", "City", "Population"];
		this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];

		this.contentTable = document.getElementById('content-table');
		this.tableBody = document.querySelector('tbody');
		this.tableHead = document.getElementById('content-thead');
		this.pageInfo = document.getElementById('page-info');
		this.searchBtn = document.getElementById('id-search-btn');
		this.firstBtn = document.getElementById('first');
		this.prevBtn = document.getElementById('prev');
		this.nextBtn = document.getElementById('next');
		this.lastBtn = document.getElementById('last');
		this.inputBox = document.getElementById('id-search');
	}

	// Record count and headers should not be changed outside the class
	// hence there are only get methods for them
	getRecordCount() {
		return this.RECORDCOUNT;
	}

	getHeaders() {
		return this.HEADERS;
	}

	calculateRecords() {
		// Estimate of available table space
		// The calculation is an estimate of how many space there is for rows
		// 160 is estimate space for header and footer of website and 40 is estimated space of a single row
		return Math.floor((window.innerHeight - 160) / 40);
	}

	// The setPageButtons, setSearchButton, and setResizeEvent are seperate functions
	// so that only the needed functions are used
	setPageButtons() {
		// Event listener for button that goes to first page
		this.firstBtn!.addEventListener("click", debounce(() => {
			this.goToFirst();
		}, 250));

		// Event listener for button that goes to previous page
		this.prevBtn!.addEventListener("click", debounce(() => {
			this.goToPrev();
		}, 250));

		// Event listener for button that goes to next page
		this.nextBtn!.addEventListener("click", debounce(() => {
			this.goToNext();
		}, 250));

		// Event listener for button that goes to last page
		this.lastBtn!.addEventListener("click", debounce(() => {
			this.goToLast();
		}, 250));
	}

	setSearchButton() {
		// // Event listener for button that searches entered ID
		this.searchBtn!.addEventListener("click", debounce(() => {
			this.searchId();
		}, 250));
	}

	setResizeEvent() {
		// Event listener for when user resizes the page
		window.addEventListener("resize", debounce(() => {
			this.resize();
		}, 150)); // Log window dimensions at most every 150ms
	}

	// Fetch headers and record count
	async getData(): Promise<boolean> {
		// API calls for record count and headers
		await fetch('/recordCount')
			.then(resp => {
				if (resp.ok) {
					return resp.json();
				}
				throw new Error('Could not retrieve data');
			})
			.then(count => {
				this.RECORDCOUNT = count;
			})
			.catch((error) => {
				console.error(error);
			});

		await fetch('/columns')
			.then(resp => {
				if (resp.ok) {
					return resp.json();
				}
				throw new Error('Could not retrieve data');
			})
			.then(count => {
				this.HEADERS = count;
			})
			.catch((error) => {
				console.error(error);
			});

		return true;
	}

	// Add rows to table
	async addRows(start: number, end: number) {
		let table = document.getElementById("content-table");
		let newTableBody = document.createElement("tbody");
		let oldTableBody = table!.querySelector("tbody");
		let link = "/records?from=" + start + "&to=" + end;

		await fetch(link)
			.then(resp => {
				if (resp.ok) {
					return resp.json();
				}
				throw new Error('Could not retrieve data');
			})
			.then(count => {
				this.data = count;
			})
			.catch((error) => {
				console.error(error);
			});

		for (let row of this.data) {
			let rowElement = document.createElement("tr");

			for (let cellText of row) {
				let cellElement = document.createElement("td");

				cellElement.textContent = cellText;
				rowElement.appendChild(cellElement); // Append cells to row
			}
			newTableBody.appendChild(rowElement);// Append rows to tbody
		}

		// If table exists, replace the new tbody with the old one
		if (!table) {
			console.error("Table is undefined");
			return;
		} else {
			table.replaceChild(newTableBody, oldTableBody!);
		}
	}

	// Delete rows from table
	deleteRows(newHeight: number, diff: number) {
		let tableBod = this.contentTable!.querySelector('tbody');
		let num = newHeight - 1;

		for (let i = num; i > (num + diff); i--) {
			tableBod!.deleteRow(i);
		}
	}

	// Load json data into table function
	loadIntoTable(clearHeader: boolean) {

		// Display loader
		$(".content").fadeOut(230);
		$(".loader").fadeIn(230);

		// UI "Aesthetic": update buttons
		this.firstBtn?.removeAttribute("disabled");
		this.prevBtn?.removeAttribute("disabled");
		this.nextBtn?.removeAttribute("disabled");
		this.lastBtn?.removeAttribute("disabled");

		if (this.trimEnd == this.getRecordCount() - 1) {
			this.lastBtn?.setAttribute("disabled", "disabled");
			this.nextBtn?.setAttribute("disabled", "disabled");
		}

		if (this.trimStart == 0) {
			this.firstBtn?.setAttribute("disabled", "disabled");
			this.prevBtn?.setAttribute("disabled", "disabled");
		}

		this.pageInfo!.innerHTML = `<p></p>`;

		// Add header only if 'clearHeader' is true
		if (clearHeader) {
			this.tableHead!.innerHTML = "";
			let headerRow = document.createElement("tr");

			// Populate the headers
			for (let headerText of this.getHeaders()) {
				let headerElement = document.createElement("th");

				headerElement.textContent = headerText;
				headerRow.appendChild(headerElement);
			}
			this.tableHead!.appendChild(headerRow);
		}

		// Clear the table
		this.tableBody!.innerHTML = "";

		// Add only records that must be displayed on table
		this.addRows(this.trimStart, this.trimEnd);

		// Display content
		$(".loader").fadeOut(230);
		$(".content").fadeIn(230);
	}

	// Search entered ID
	searchId() {
		let id = parseInt((<HTMLInputElement>this.inputBox).value);
		let numRecords = this.getRecordCount() - 1;

		if (id < 0 || id > numRecords || isNaN(id)) {
			// User info: Display error message
			this.pageInfo!.innerHTML = `<p>No records to display</p>`;
		} else {
			// Use entered ID to calculate what records should display
			if ((this.getRecordCount() - 1) - id >= this.records) {
				this.trimStart = id;
				this.trimEnd = this.trimStart + (this.records - 1);
			} else {
				this.trimEnd = this.getRecordCount() - 1;
				this.trimStart = this.trimEnd - this.records + 1;
			}
			this.loadIntoTable(false);
		}
		(<HTMLInputElement>document.getElementById('id-search')).value = 'Enter ID number';
	}

	// Set trim to start of data
	goToFirst() {
		this.trimStart = 0;
		this.trimEnd = this.trimStart + this.records - 1;
		this.loadIntoTable(false);
	}

	// Set trim to previous data
	goToPrev() {
		// If previous page is end of data && there are not enough records to fill window
		if ((this.trimStart - 1) - (this.records - 1) < 0) {
			this.trimStart = 0;
			this.trimEnd = this.trimStart + this.records - 1;
		} else {
			this.trimEnd = this.trimStart - 1;
			this.trimStart = this.trimEnd - this.records + 1;
		}
		this.loadIntoTable(false);
	}

	// Set trim to next data
	goToNext() {
		// If next page is end of data && there are not enough records to fill window
		if ((this.getRecordCount() - 1) - (this.trimEnd + 1) < this.records) {
			this.trimEnd = this.getRecordCount() - 1;
			this.trimStart = this.trimEnd - this.records + 1;
		} else {
			this.trimStart = this.trimEnd + 1;
			this.trimEnd = this.trimStart + this.records - 1;
		}
		this.loadIntoTable(false);
	}

	// Set trim to end of data
	goToLast() {
		this.trimEnd = this.getRecordCount() - 1;
		this.trimStart = this.trimEnd - this.records + 1;
		this.loadIntoTable(false);
	}

	// Add/remove rows from table based on resize event of the window
	async resize() {
		// Calculate number rows to be added/deleted
		let newHeight = this.calculateRecords();
		let diff = newHeight - this.records;

		let start = this.trimStart;
		let end = this.trimEnd + diff;

		if (diff < 0) {
			// If screen is made smaller, call delete rows function with this.records (amount of rows that were on the screen)
			// and diff (how many rows should be deleted)
			this.deleteRows(this.records, diff);

			this.trimEnd = this.trimEnd + diff;
		} else if (diff > 0 && end >= this.getRecordCount()) {
			// Prepend rows as last page gets bigger
			end = this.getRecordCount() - 1;
			start = end - (newHeight - 1);
			console.log("End reached, displaying record ", start, " to ", end);

			await this.addRows(start, end);

			this.trimStart = this.trimStart - diff;
			this.trimEnd = this.getRecordCount() - 1;
		} else if (diff > 0 && start <= this.getRecordCount() - 1) {
			// Add rows if end of data is not yet reached
			this.addRows(start, end);

			this.trimEnd = this.trimEnd + diff;
		}
		this.records = newHeight;

		// UI "Aesthetic": update buttons
		this.firstBtn?.removeAttribute("disabled");
		this.prevBtn?.removeAttribute("disabled");
		this.nextBtn?.removeAttribute("disabled");
		this.lastBtn?.removeAttribute("disabled");

		if (this.trimEnd == this.getRecordCount() - 1) {
			this.lastBtn?.setAttribute("disabled", "disabled");
			this.nextBtn?.setAttribute("disabled", "disabled");
		}

		if (this.trimStart == 0) {
			this.firstBtn?.setAttribute("disabled", "disabled");
			this.prevBtn?.setAttribute("disabled", "disabled");
		}
	}
}
