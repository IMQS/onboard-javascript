let fromParameter = 0;
let recordCount: number;

// Gets The 2nd paramater from the 1st parameter
function getParameters(fromParameter: number): number {
	let toParameter: number;
	let noOfRows = getNoOfRows();

	toParameter = fromParameter + noOfRows;
	return toParameter;
}

// Gets the number of rows on the screen
function getNoOfRows(): number {
	const height = window.innerHeight;
	let noOfRows = Math.floor(height / 40);
	return noOfRows;
}

//// Functions To Create The HTML
// Heading Row
function createHeadingColumn(headingData: string) {
	const heading: HTMLElement | null = document.getElementById("heading");

	let headings = `<div class="headings" id="headings">${headingData}</div>`;
	if (heading !== null) {
		heading.innerHTML += headings;
	}
}

// Table Content
function appendTableContent(contentData: string | string[]) {
	const content: HTMLElement | null = document.getElementById("content");

	let table = `<div id="row-${contentData[0]}" class="rows"></div>`;
	if (content !== null) {
		content.innerHTML += table;
	} else {
		return alert("ERROR");
	}

	let row: HTMLElement | null = document.getElementById("row-" + contentData[0]);
	for (let x of contentData) {
		let rowCols = `<div class="row_cols">${x}</div>`;
		if (row !== null) {
			row.innerHTML += rowCols;
		}
	}
}

//// Fetch Requests
// Response Error Handling
function handleErrors(response: Response) {
	if (!response.ok) {
		throw Error(response.statusText);
	}
	return response;
}

// Heading Row (Getting the columns data)
function getHeadings(): Promise<void> {
	return fetch("http://localhost:2050/columns", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(handleErrors)
		.then((response: Response) => response.json())
		.then((headingData: string | string[]) => {
			for (let heading of headingData) {
				createHeadingColumn(heading);
			}
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

// Table Content (Getting the table's data)
function getTable(): Promise<void> {
	const content: HTMLElement | null = document.getElementById("content");
	let toParameter = getParameters(fromParameter);
	const pageStats: HTMLElement | null = document.getElementById("pageStats");

	// Clears Table
	if (content !== null) {
		content.innerHTML = "";
	}

	// Displays The Current Results Being Shown
	let currentStats = `Showing results from ${fromParameter} to ${toParameter} out of ${recordCount} results.`;
	if (pageStats !== null) {
		pageStats.innerHTML = currentStats;
	}

	return fetch(`http://localhost:2050/records?from=${fromParameter}&to=${toParameter}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(handleErrors)
		.then((res: Response) => res.json())
		.then((contentData: string | string[]) => {
			for (let x of contentData) {
				appendTableContent(x);
			}
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

// Gets Total Of All Records
function getRecordCount(): Promise<void> {
	return fetch("http://localhost:2050/recordCount", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
		.then(handleErrors)
		.then((res: Response) => res.json())
		.then((data: number) => {
			recordCount = data;
		})
		.catch((error: Error) => {
			console.log(error);
		});
}

//// Debounce
function debounce(fn: () => void, delay: number) {
	let timer: number
	return function () {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn();
		}, delay);
	};
}

//// Sizing And Resizing
function resizing() {
	let end = fromParameter + getNoOfRows();
	let toParameter: number;
	let maxRecordsID = recordCount - 1;

	if (end > maxRecordsID) {
		toParameter = maxRecordsID;
		fromParameter = toParameter - getNoOfRows();
	}
	getTable();
}

//// Navigation
// Next
class Next {
	nextButton: HTMLElement | null;
	nextTimer: number = 0

	constructor() {
		this.nextButton = document.getElementById("next");

		const nextDebounce = (fn: () => void, delay: number) => {
			return () => {
				clearTimeout(this.nextTimer);
				this.nextTimer = setTimeout(() => {
					fn();
				}, delay);
			};
		};

		let next = () => {
			let toParameter = getParameters(fromParameter);
			let maxRecordsID = recordCount - 1;

			if (toParameter === maxRecordsID) {
				alert("You have reached the final page");
			}

			let nextAmount = toParameter - fromParameter + 1;
			fromParameter = fromParameter + nextAmount;
			toParameter = fromParameter + getNoOfRows();

			let end = fromParameter + getNoOfRows();

			if (end > maxRecordsID) {
				toParameter = maxRecordsID;
				fromParameter = toParameter - getNoOfRows();
			}

			nextDebounce(getTable, 500)()
		};

		if (this.nextButton) {
			this.nextButton.addEventListener("click", next);
		}
	}
}

// Previous
class Prev {
	prevButton: HTMLElement | null;
	prevTimer: number = 0

	constructor() {
		this.prevButton = document.getElementById("prev");

		const prevDebounce = (fn: () => void, delay: number) => {
			return () => {
				clearTimeout(this.prevTimer);
				this.prevTimer = setTimeout(() => {
					fn();
				}, delay);
			};
		};

		let prev = () => {
			let toParameter = getParameters(fromParameter);

			if (fromParameter === 0) {
				alert("You Have Reached The First Page");
			} else {
				let prevAmount = toParameter - fromParameter + 1;

				let intOne = fromParameter - prevAmount;

				if (intOne < 0) {
					fromParameter = 0;
				} else {
					fromParameter = intOne;
				}

				prevDebounce(getTable, 500)()
			}
		};

		if (this.prevButton) {
			this.prevButton.addEventListener("click", prev);
		}
	}
}

// ID Jump
function idJump() {
	const input: HTMLInputElement | null = document.querySelector("input");
	let toParameter = getParameters(fromParameter);
	let currentID = fromParameter;
	let search: string
	if (input) {
		search = input.value;
	} else {
		return alert("ERROR!!!")
	}
	let end = parseInt(search) + getNoOfRows();
	let maxRecordsID = recordCount - 1;

	if (search !== "" && parseInt(search) <= maxRecordsID && parseInt(search) >= 0) {
		if (end > maxRecordsID) {
			toParameter = maxRecordsID;
			fromParameter = toParameter - getNoOfRows();
		} else {
			fromParameter = parseInt(search);
			toParameter = fromParameter + getNoOfRows();
		}
	} else if (search !== "") {
		alert("Make Sure Your Desired ID Is Not A Negative Number Or Doesn't Exceed 999999");
		fromParameter = currentID;
		toParameter = fromParameter + getNoOfRows();
		input.value = "";
	}

	getTable();
}

//// On Window Load
window.onload = () => {
	const next = new Next(); // next class
	const prev = new Prev(); // prev class
	window.addEventListener("input", debounce(idJump, 500));
	window.addEventListener("resize", debounce(resizing, 500));
	getRecordCount()
		.then(() => {
			return getHeadings();
		})
		.then(() => {
			return getTable();
		});
};
