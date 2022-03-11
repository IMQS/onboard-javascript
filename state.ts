class State {
	records: number;
	trimStart: number;
	trimEnd: number;

	private RECORDCOUNT: number;
	private HEADERS: string[];
	data: any;

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
		this.records = this.calculateRecords();
		this.trimStart = 0;
		this.trimEnd = this.records - 1;

		// Default values for variables that stores server data
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

	getRecordCount() {
		return this.RECORDCOUNT;
	}

	getHeaders() {
		return this.HEADERS;
	}

	setRecordCount(value: number) {
		this.RECORDCOUNT = value;
	}

	setHeaders(value: string[]) {
		this.HEADERS = value;
	}

	calculateRecords() {
		// Estimate of available table space
		// The calculation is an estimate of how many space there is for rows (160 is estimate space for header and footer of website)
		return Math.floor((window.innerHeight - 160) / 40);
	}

	setCurrentState() {
		let tableBody = document.querySelector('tbody');
		this.records = tableBody!.rows.length;

		if (this.records != 0) {
			this.trimStart = parseInt(tableBody!.rows[0].cells[0].innerHTML);
			this.trimEnd = parseInt(tableBody!.rows[this.records - 1].cells[0].innerHTML);
		} else {
			return;
		}
		console.log("Num records: ", this.records, " start: ", this.trimStart, " end: ", this.trimEnd);
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
				this.setRecordCount(count);
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
				this.setHeaders(count);
			})
			.catch((error) => {
				console.log(error);
			});

		return true;
	}

	// Add rows to table
	async addRows(start: number, end: number, isAppend: boolean) {
		let table = document.getElementById("content-table");
		let newTableBody = document.createElement("tbody");

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
				console.log(error);
			});

		// Append or prepend rows to table
		if (isAppend) {
			for (let row of this.data) {
				let rowElement = document.createElement("tr");

				for (let cellText of row) {
					let cellElement = document.createElement("td");

					cellElement.textContent = cellText;
					rowElement.appendChild(cellElement); // Append cells
				}
				newTableBody.appendChild(rowElement);// Append rows
			}
		} else {
			// Reverse order of data and save in temp variable
			let rowData: any;
			rowData = [];
			let k = 0;
			for (let i = this.data.length - 1; i >= 0; i--) {
				rowData[k] = this.data[i];
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
				newTableBody.prepend(rowElement);// Prepend rows
			}
		}
		if (!table)
			return;
		table.replaceChild(newTableBody, this.tableBody!);
	}

	// Delete rows from table
	deleteRows(newHeight: number, diff: number) {
		let num = newHeight - 1;

		for (let i = num; i > (num + diff); i--) {
			this.tableBody!.deleteRow(i);
		}
	}


	// Load json data into table function
	loadIntoTable(clearHeader: boolean) {

		// Display loader
		$(".content").fadeOut(200);
		$(".loader").fadeIn(200);

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

		if (clearHeader) {
			this.tableHead!.innerHTML = "";
			let headerRow = document.createElement("tr");

			// Populate the headers
			for (let headerText of this.getHeaders()) {
				let headerElement = document.createElement("th");

				headerElement.textContent = headerText;
				headerRow.appendChild(headerElement);
			}
			this.tableHead!.appendChild(headerRow)
		}

		// Clear the table
		this.tableBody!.innerHTML = "";

		// Add only records that must be displayed on table
		this.addRows(this.trimStart, this.trimEnd, true);

		// Display content
		$(".loader").fadeOut(200);
		$(".content").fadeIn(200);
	}

	searchId() {
		this.setCurrentState();
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

	goToFirst() {
		this.trimStart = 0;
		this.trimEnd = this.trimStart + this.records - 1;
		this.loadIntoTable(false);
	}

	goToPrev() {
		this.setCurrentState();
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

	goToNext() {
		this.setCurrentState();
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

	goToLast() {
		this.trimEnd = this.getRecordCount() - 1;
		this.trimStart = this.trimEnd - this.records + 1;
		this.loadIntoTable(false);
	}

	async resize() {
		this.setCurrentState();
		// Calculate number rows to be added/deleted
		let newHeight = this.calculateRecords();
		console.log("records ", this.records, " vs numRows ", this.records);
		let diff = newHeight - this.records;

		let start = this.trimStart;
		let end = this.trimEnd + diff;

		if (diff < 0) {
			// Delete rows from last page
			this.deleteRows(this.records, diff);

			this.trimEnd = this.trimEnd + diff;
		} else if (diff > 0 && this.trimEnd == this.getRecordCount() - 1) {
			// Prepend rows as last page gets bigger
			// 'start' and 'end' only fetches the amount that should be prepended
			end = this.RECORDCOUNT - 1;
			start = this.trimStart - diff;

			await this.addRows(start, end, false);

			this.trimStart = this.trimStart - diff;
		} else if (diff > 0 && end >= this.getRecordCount()) {
			// Appends remaining records until RECORDCOUNT - 1,
			// then prepends the rest
			let addEnd = (this.getRecordCount() - 1) - this.trimEnd;
			end = this.getRecordCount() - 1;
			start = end - addEnd + 1;
			this.addRows(start, end, true);

			let addTop = diff - addEnd;
			end = this.trimStart - 1;
			start = this.trimStart - addTop;

			await this.addRows(start, end, false);

			this.trimEnd = this.getRecordCount() - 1;
			this.trimStart = this.trimStart - addTop
		} else if (diff > 0 && start <= this.getRecordCount() - 1) {
			// Add rows if end of data is not yet reached
			this.addRows(start, end, true);

			this.trimEnd = this.trimEnd + diff
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
