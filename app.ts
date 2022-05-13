let fromNumber = 0;
let recordNumberTotal: number;
let count = 0;
let timeout = 0;

function checkResponseError(response: Response) {
	if (!response.ok) {
		throw Error(response.statusText);
	}
	return response;
}

function debounce(func: () => void, delay: number) {
	return function () {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			func();
		}, delay);
	};
}

function createNavigation() {
	let recordNav: HTMLElement | null = document.getElementById("record-navigation-container"); // Navigation area
	if (recordNav) {
		recordNav.innerHTML = `
		<div id="navigation-btns">
			<button value="first" id="first-page-btn">First Page</button>
			<button value="previous" id="previous-records-btn">Previous</button>
			<button value="next" id="next-records-btn">Next</button>
			<button value="last" id="last-page-btn">Last Page</button>
			<button id="confirmation-btn">Get Record</button>
		</div>
		<div class="current-page-container">
			<p id="current-page"></p>
		</div>
		`;
	}
}

function getRecords(fromNumber: number, toNumber: number): Promise<void> {
	return fetch(`http://localhost:2050/records?from=${fromNumber}&to=${toNumber}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(checkResponseError)
		.then((response: Response) => response.json())
		.then((data: string[]) => {

			let infoColumns: HTMLElement | null = document.getElementById("info-columns-container"); // Information
			let currentPage: HTMLElement | null = document.getElementById("current-page");

			if (infoColumns) {
				infoColumns.innerHTML = "";

				for (let i of data) {
					dynamicGrid(i);
				}
			}

			if (currentPage) {
				currentPage.innerHTML = `${fromNumber}  / ${toNumber}.`;
			}
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

function recordSelection() {
	let recordNav: HTMLElement | null = document.getElementById("record-navigation-container"); // Navigation area
	if (!recordNav) {
		alert("The navigation is not working correctly refresh the page");
		return;

	}

	let singleRecordSelection = `
		<button id="return-btn">Return</button>
		<div id="user-input-data">
			<div class="navigation-input-area-id" id="id">
				<label class="record-labels" for="record-id">Enter record ID :</label>
				<input type="text" name="record-id" id="record-id" class="navigation-input" value="0" />
			</div>
			<p class="amount-of-records"></p>
		</div>
		<button id="get-record-btn">See Record</button>`;

	recordNav.innerHTML = singleRecordSelection;

	let returnBtn: HTMLElement | null = document.getElementById("return-btn");
	let recordIdInput = <HTMLInputElement | null>document.getElementById("record-id");
	let numberOfRows = Math.floor(window.innerHeight / 50);
	let getSingleRecord: HTMLElement | null = document.getElementById("get-record-btn");

	if (returnBtn) {
		// Resets to the first page
		returnBtn.addEventListener("click", () => {
			createNavigation();
			resizeScreenData();
			fromNumber = 0;
			getRecords(fromNumber, fromNumber + numberOfRows);
			new PageNavigation();
		});
	}

	if (getSingleRecord) {
		getSingleRecord.addEventListener("click", () => {
			if (recordIdInput) {

				let recordIdValue = recordIdInput.value;
				fromNumber = Number(recordIdValue);

				let toNumber = fromNumber + numberOfRows;
				let finalRecord = recordNumberTotal - 1;

				if (toNumber > finalRecord) {
					toNumber = finalRecord;
					fromNumber = toNumber - numberOfRows;
				}

				let check = ["undefined", "string", ""];

				if (check.includes(typeof fromNumber) || fromNumber < 0) {
					alert("Does not exists");
					recordIdValue = "0";
				} else if (typeof fromNumber === "number" && fromNumber >= 0) {
					getRecords(fromNumber, toNumber);
				}
			}
		});
	}
}

function createHeadingGrid(headings: string) {
	let headingColumns: HTMLElement | null = document.getElementById("column-headings-container"); // Headings
	let headingsData = `<h1 class="column-heading">${headings}</h1>`;

	if (headingColumns) {
		headingColumns.innerHTML += headingsData;
	}
}

function recordCount(): Promise<void> {
	return fetch("http://localhost:2050/recordCount", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(checkResponseError)
		.then((response: Response) => response.json())
		.then((data: number) => {
			recordNumberTotal = data;
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

function headingRowCreation(): Promise<void> {
	return fetch("http://localhost:2050/columns", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(checkResponseError)
		.then((response: Response) => response.json())
		.then((data: string[]) => {
			for (let i of data) {
				createHeadingGrid(i);
			}
			resizeScreenData();
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

function dynamicGrid(columnData: string) {
	let infoColumns: HTMLElement | null = document.getElementById("info-columns-container"); // Information
	// Creates the row that the info will display and adds it to the infoColumnsArea.
	let infoDataRow = `<div id="info-row-${columnData[0]}" class="info-rows"></div>`;

	if (infoColumns) {
		infoColumns.innerHTML += infoDataRow;
		// Gets the created rows.
		let finalInfoDataRow = document.getElementById("info-row-" + columnData[0]);
		if (finalInfoDataRow) {
			// Loops through
			for (let x of columnData) {
				let infoData = `<p class="info-row-data">${x}</p>`;
				finalInfoDataRow.innerHTML += infoData;
			}
		}
	}
}

function resizeScreenData() {
	let toNumber: number;
	let recordNav: HTMLElement | null = document.getElementById("record-navigation-container");
	let nextBtn = <HTMLButtonElement | null>document.getElementById("next-records-btn");
	let previousBtn = <HTMLButtonElement | null>document.getElementById("previous-records-btn");
	let navBtns = document.getElementById("navigation-btns");
	if (recordNav) {
		if (recordNav.contains(navBtns as HTMLDivElement) && nextBtn && previousBtn) {
			let numberOfRows = Math.floor(window.innerHeight / 50);

			nextBtn.disabled = false;
			previousBtn.disabled = false;

			let finalRecord = recordNumberTotal - 1;

			if (fromNumber + numberOfRows >= finalRecord) {
				fromNumber = finalRecord - numberOfRows;

				nextBtn.disabled = true;
				previousBtn.disabled = false;
			} else if (fromNumber <= 0) {
				fromNumber = 0;

				nextBtn.disabled = false;
				previousBtn.disabled = true;
			}

			toNumber = fromNumber + numberOfRows;

			getRecords(fromNumber, toNumber);
		}
	}
}

class PageNavigation {
	nextBtn: HTMLButtonElement | null;
	previousBtn: HTMLButtonElement | null;
	firstPageBtn: HTMLButtonElement | null;
	lastPageBtn: HTMLButtonElement | null;
	confirmationBtn: HTMLButtonElement | null;

	constructor() {

		function navigationDebounce(func: (argOne: number, argTwo: number) => void, delay: number) {
			return function (argOne: number, argTwo: number) {
				clearTimeout(timeout);

				timeout = setTimeout(() => {
					func(argOne, argTwo);
				}, delay);
			};
		}

		this.nextBtn = <HTMLButtonElement | null>document.getElementById("next-records-btn");
		this.previousBtn = <HTMLButtonElement | null>document.getElementById("previous-records-btn");
		this.firstPageBtn = <HTMLButtonElement | null>document.getElementById("first-page-btn");
		this.lastPageBtn = <HTMLButtonElement | null>document.getElementById("last-page-btn");
		this.confirmationBtn = <HTMLButtonElement | null>document.getElementById("confirmation-btn");

		if (this.confirmationBtn) {
			this.confirmationBtn.addEventListener("click", recordSelection);
		}

		if (this.nextBtn && this.previousBtn && this.firstPageBtn && this.lastPageBtn) {
			let nextPage = () => {
				let numberOfRows = Math.floor(window.innerHeight / 50);
				fromNumber = fromNumber + numberOfRows;
				let toNumber = fromNumber + numberOfRows;

				let finalRecord = recordNumberTotal - 1;
				this.previousBtn!.disabled = false;

				if (toNumber >= finalRecord) {
					this.nextBtn!.disabled = true;
					fromNumber = finalRecord - numberOfRows;
				}

				console.log(fromNumber, toNumber);

				navigationDebounce(getRecords, 50)(fromNumber, toNumber)
			};


			this.nextBtn.addEventListener("click", nextPage);

			let previousPage = () => {
				let numberOfRows = Math.floor(window.innerHeight / 50);
				fromNumber = fromNumber - numberOfRows;
				let toNumber = fromNumber + numberOfRows;

				this.nextBtn!.disabled = false;

				if (fromNumber <= 0) {
					this.previousBtn!.disabled = true;
					fromNumber = 0;
				}

				navigationDebounce(getRecords, 50)(fromNumber, toNumber)
			};

			this.previousBtn.addEventListener("click", previousPage);

			let firstPage = () => {
				fromNumber = 0;
				let numberOfRows = Math.floor(window.innerHeight / 50);
				let toNumber = fromNumber + numberOfRows;

				this.nextBtn!.disabled = false;
				this.previousBtn!.disabled = true;

				getRecords(fromNumber, toNumber);
			};

			this.firstPageBtn.addEventListener("click", firstPage);

			let lastPage = () => {
				let finalRecord = recordNumberTotal - 1;
				let numberOfRows = Math.floor(window.innerHeight / 50);
				fromNumber = finalRecord - numberOfRows;

				this.nextBtn!.disabled = true;
				this.previousBtn!.disabled = false;

				getRecords(fromNumber, finalRecord);
			};

			this.lastPageBtn.addEventListener("click", lastPage);
		}
	}
}

window.onload = () => {
	createNavigation();
	headingRowCreation();
	fromNumber = 0;
	new PageNavigation();
	window.addEventListener("resize", debounce(resizeScreenData, 500));
}
