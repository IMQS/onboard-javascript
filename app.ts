import { ajax, css } from "jquery";

class Myclass {
	firstNumber: number = 0;
	lastNumber: number = 0;
	backend: string = "http://localhost:2050";
	resizeTimeout: number = 0;

	/** fetches the number of records from backend */
	fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.json();
			})
			.catch(err => {
				throw 'Error fetching the record count: ' + err;
			});
	}

	/** fetches columns from backend */
	fetchColumns(): Promise<string[]> {
		return fetch(`${this.backend}/columns`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch columns';
				}
				return res.json();
			})
			.catch(err => {
				throw 'Error fetching columns' + err;
			});
	}

	/** fetches records from backend */
	fetchRecords(from: number, to: number): Promise<any[]> {
		return fetch(`${this.backend}/records?from=${from}&to=${to}`)
			.then(res => {
				if (!res.ok) {
					throw "Sorry, there's a problem with the network";
				}
				return res.json();
			})
			.catch(err => {
				throw 'Error fetching records from server ' + err;
			});
	}
}

const myClass = new Myclass();

/** Initializes the table head */
function createTable():Promise<string[]> {
	return myClass.fetchColumns()
		.then(columns => {
			for (const col of columns) {
				$(".head").append(`<th>${col}</th>`);
			}
			return columns
		})
		.catch(err => {
			throw 'Error creating table' + err;
		});
}

/** calculates the number of rows that can fit the screen */
const calculatingRows = (): number => {
	const screenHeight = window.innerHeight;
	const availableHeight = screenHeight - 105;
	let rowHeight = 35;
	if (availableHeight <= 0) {
		return 0;
	} else {
		let maxRows = Math.floor(availableHeight / rowHeight);
		return maxRows;
	}
};

/** calls to re-display records when screen is adjusted */
function handleResize(recordCount: number) {
	$(window).on('resize', () => {
		clearTimeout(myClass.resizeTimeout);
		myClass.resizeTimeout = setTimeout(async () => {
			displayRecords(recordCount)
			let inputValue = $('#searchInput').val();
			if (inputValue !== '') {
				await searchRecordsAndResize(recordCount);
			}
		}, 250);
	});
}

/** display records that fit the screen */
async function displayRecords(recordCount: number): Promise<void> {
	$('#loader').show();
	const inputValue = $('#searchInput').val() as number;
	const calculatedRows = calculatingRows();
	const { firstNumber, lastNumber } = calculateFirstAndLastNumbers(calculatedRows, recordCount);
	updateArrowVisibility(firstNumber, lastNumber, recordCount);
	const records = await fetchAndDisplayRecords(firstNumber, lastNumber, inputValue);
	$('#page').empty().append(`Showing record: ${firstNumber} - ${lastNumber}`);
	$('#loader').hide();
}

function calculateFirstAndLastNumbers(calculatedRows: number, recordCount: number) {
	let firstNumber, lastNumber;
	 if (myClass.firstNumber < 0 || myClass.firstNumber > recordCount) {
		firstNumber = 0;
	} else {
		firstNumber = myClass.firstNumber;
	}
	lastNumber = firstNumber + calculatedRows - 1;
	if (lastNumber >= recordCount) {
		lastNumber = recordCount;
		firstNumber = lastNumber - (calculatedRows - 1)
	}
	return { firstNumber, lastNumber };
}

function updateArrowVisibility(firstNumber: number, lastNumber: number, recordCount: number) {
	if (firstNumber === 0) {
		$('.arrow-left').hide();
	} else {
		$('.arrow-left').show();
	}

	if (lastNumber >= recordCount) {
		$('.arrow-right').hide();
	} else {
		$('.arrow-right').show();
	}
}

async function fetchAndDisplayRecords(firstNumber: number, lastNumber: number, inputValue: number) {
	const records = await myClass.fetchRecords(firstNumber, lastNumber);
	const tbody = $("tbody");
	tbody.empty();
	for (const record of records) {
		/** creates row for each record*/ 
		$("tbody").append(`<tr class="row"></tr>`);
		const lastRow = $(".row:last");
		for (const value of record) {
			/** assign each record to their column in a specified row */
			lastRow.append(`<td>${value}</td>`);
		}
		if (record.includes(inputValue)) {
			/** highlights the searched row */
			lastRow.css('background-color', '#DDC0B4');
		}
		$("tbody").append(lastRow);
	}
	return records;
}

/** recalculates the record range that includes inputValue */
async function searchRecordsAndResize(recordCount: number): Promise<void> {
	let inputValue = $('#searchInput').val() as number;
	if (inputValue < 0 || inputValue > recordCount) {
		$('.modal').css('display', 'block');
		$('.content').append(`<p>${inputValue} is not a number within the range. Please try a different number</p>`);
		$('#page').empty().append(`Showing record: ${myClass.firstNumber} - ${myClass.lastNumber}`);
		$('#searchInput').val('');
	}
	let calculatedRows = calculatingRows();
	/** divides the calculated max rows in half*/
	const halfRange = Math.floor(calculatedRows / 2);
	myClass.firstNumber = Math.max(0, inputValue - halfRange);
	myClass.lastNumber = Math.min(recordCount, myClass.firstNumber + (calculatedRows - 1));
	await displayRecords(recordCount);
}

/** Navigates to the next set of records */
async function rightArrow(recordCount: number): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	/** retrieves the last row */
	const lastRow = document.querySelector("#recordsTable tbody .row:last-child");
	/** checks if the last row exists */
	if (lastRow) {
		const cells = lastRow.querySelectorAll("td");
		const lastRecord = [];
		for (const cell of Array.from(cells)) {
			lastRecord.push(cell.textContent || "");
		}
		/** determines te value in the last row */
		const lastID = parseFloat(lastRecord[0]);
		/** checks if the last value is within range */
		if (0 <= lastID && lastID <= (recordCount)) {
			const tbody = $("tbody");
			tbody.empty();
			/** calculates the first number of the page */
			myClass.firstNumber = lastID + 1;
			let calculatedRows = calculatingRows();
			/** calculates the last number of the page */
			myClass.lastNumber = myClass.firstNumber + (calculatedRows - 1);
			await displayRecords(recordCount);
		}
	}
}

async function leftArrow(recordCount: number): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	/** retrieves the first row */
	const firstRow = document.querySelector("#recordsTable tbody .row:first-child");
	if (firstRow) {
		const cells = firstRow.querySelectorAll("td");
		const firstRecord = [];
		for (const cell of Array.from(cells)) {
			firstRecord.push(cell.textContent || "");
		}
		/** determines te value in the first row */
		const firstID = parseFloat(firstRecord[0]);
		if (0 <= firstID && firstID <= (recordCount)) {
			const tbody = $("tbody");
			tbody.empty();
			const calculatedRows = calculatingRows();
			myClass.lastNumber = firstID - 1;
			myClass.firstNumber = myClass.lastNumber - (calculatedRows - 1);
			await displayRecords(recordCount);
		}
	}
}

window.onload = () => {
	myClass.fetchRecordCount()
		.then(count => {
			let recordCount: number = count - 1;
			displayRecords(recordCount);
			handleResize(recordCount)
			searchRecordsAndResize(recordCount)
			$('#btnSearch').on("click", (event) => {
				event.preventDefault();
				$('#page').empty();
				searchRecordsAndResize(recordCount);
			});
			$('.arrow-right').on('click', () => {
				rightArrow(recordCount);
			});
			$('.arrow-left').on('click', () => {
				leftArrow(recordCount);
			});
		})
		.catch(err => {
			throw new Error('Error fetching record count' + err);
		});
	createTable();
	$('#closeModalBtn').on("click", () => {
		$('.content').empty();
		$('.modal').css('display', 'none');
	});
	$('#searchInput').on('keydown', (event) => {
		if (event.key === 'e' || event.key === 'E') {
			event.preventDefault();
		}
	});
	$('#searchInput').on('input', (event) => {
		const inputValue = $('#searchInput').val() as string;
		if (inputValue.includes('.')) {
			$('#searchInput').val(inputValue.replace('.', ''));
		}
	});
}
