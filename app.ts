import { ajax, css } from "jquery";
class GlobalVariables {
	firstNumber = 0;
	lastNumber = 0;
	backend = "http://localhost:2050";

	async fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then((res) => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.json();
			})
			.catch((err) => {
				throw 'Error fetching the record count: ' + err;
			})
	}

	async fetchColumns(): Promise<string[]> {
		return fetch(`${this.backend}/columns`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch columns';
				}
				return res.json();
			}).catch(err => {
				throw 'Error fetching columns' + err;
			})
	}

	async fetchRecords(from: number, to: number): Promise<any[]> {
		return fetch(`${this.backend}/records?from=${from}&to=${to}`)
			.then(res => {
				if (!res.ok) {
					throw "Sorry, there's a problem with the network";
				}
				return res.json();
			}).catch(err => {
				throw 'Error fetching records from server ' + err;
			})
	}
}

const globalVars = new GlobalVariables();
let recordCount:number;

globalVars.fetchRecordCount()
	.then((count) => {
		recordCount = count - 1; // Assign the fetched count to the global variable
		displayRecords(recordCount);
	})
	.catch(err => {
		throw 'Error fetching record count' + err;
	})

async function createTable() {
	return globalVars.fetchColumns()
		.then(columns => {
			for (const col of columns) {
				$(".head").append(`<th>${col}</th>`);
			}
		})
		.catch(err => {
			throw 'Error creating table' + err;
		})
}

const adjustRowsByScreenHeight = ():number => {
	const screenHeight = window.innerHeight;
	const availableHeight = screenHeight - 105; // subtracts the space used from the screeen
	let rowHeight = 35;
	if (availableHeight <= 0) {
		return 0;
	} else {
		let maxRows = Math.floor(availableHeight / rowHeight);
		return maxRows;
	}
}

$(window).on('resize', async () => {
	let resizeTimeout: number;
	resizeTimeout = setTimeout(async () => {
		$('#loader').show();
		await displayRecords(recordCount);
		let inputValue = $('#searchInput').val(); // priotizes the search input value if available
		if (inputValue !== '') {
			await updateRecordsAndResize(Number(inputValue));
		}
		$('#loader').hide();
	}, 500)
})

async function displayRecords(recordCount: number): Promise<void> {
	$('#loader').show();
	let calculatedRows = adjustRowsByScreenHeight();
	const inputValue = $('#searchInput').val() as number;
	if (calculatedRows === 0) {
		globalVars.lastNumber = globalVars.firstNumber;
	} else if (globalVars.firstNumber < 0) {
		globalVars.firstNumber = 0;
		globalVars.lastNumber = globalVars.firstNumber + (calculatedRows - 1);
	} else {
		globalVars.lastNumber = globalVars.firstNumber + (calculatedRows - 1);
	}
	if (globalVars.firstNumber === 0) {
		$('.arrow-left').hide();
	} else {
		$('.arrow-left').show();
	}
	if (globalVars.lastNumber >= recordCount) {
		$('.arrow-right').hide();
	} else {
		$('.arrow-right').show();
	}
	if (!isNaN(globalVars.firstNumber) && !isNaN(globalVars.lastNumber) && !isNaN(recordCount) && !isNaN(calculatedRows)) {
		if (globalVars.lastNumber <= recordCount && globalVars.lastNumber >= 0) {
			return globalVars
				.fetchRecords(globalVars.firstNumber, globalVars.lastNumber)
				.then((records) => {
					$('#page').empty();
					$('#page').append(`Showing record: ${globalVars.firstNumber} - ${globalVars.lastNumber}`);
					$('#loader').hide();
					const tbody = $("tbody");
					tbody.empty();
					for (const record of records) {
						$("tbody").append(`<tr class="row"></tr>`); // creates row for each record
						const lastRow = $(".row:last");
						for (const value of record) {
							lastRow.append(`<td>${value}</td>`); // assign each record to their column in a specified row
						}
						if (record.includes(inputValue)) {
							lastRow.css('background-color', '#DDC0B4'); // highlights the searched row
						}
						$("tbody").append(lastRow);
					}
				})
				.catch((err) => {
					throw 'Error fetching records' + err;
				});
		} else {
			globalVars.firstNumber = recordCount - (calculatedRows - 1);
			globalVars.lastNumber = recordCount;
			return globalVars
				.fetchRecords(globalVars.firstNumber, recordCount)
				.then((records) => {
					$('#page').empty();
					$('#page').append(`Showing record: ${globalVars.firstNumber} - ${globalVars.lastNumber}`);
					$('#loader').hide();
					const tbody = $("tbody");
					tbody.empty();
					for (const record of records) {
						$("tbody").append(`<tr class="row"></tr>`); // creates row for each record
						const lastRow = $(".row:last");
						for (const value of record) {
							lastRow.append(`<td>${value}</td>`); // assign each record to their column in a specified row
						}
						if (record.includes(inputValue)) {
							lastRow.css('background-color', '#DDC0B4'); // highlights the searched row
						}
						$("tbody").append(lastRow);
						$('#loader').hide();
					}
				})
				.catch((err) => {
					throw 'Error fetching records' + err;
				})
		}
	} else {
		throw new Error("Invalid numeric values detected.");
	}
}

async function updateRecordsAndResize(inputValue: number) {
	if (inputValue < 0 || inputValue > recordCount) { // check if the search input 
		$('.modal').css('display', 'block');//opens modal if search input is not within range
		$('.content').append(`<p>${inputValue} is not a number within the range. Please try a different number</p>`);
		$('#searchInput').val(''); // empties search bar
		return
	}
	let calculatedRows = adjustRowsByScreenHeight();
	const halfRange = Math.floor(calculatedRows / 2); // divides the calculated max rows in half 
	globalVars.firstNumber = Math.max(0, inputValue - halfRange);
	globalVars.lastNumber = Math.min(recordCount, globalVars.firstNumber + (calculatedRows - 1));
	await displayRecords(recordCount);
}

async function rightArrow(): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	const lastRow = document.querySelector("#recordsTable tbody .row:last-child"); // retrieves the last row
	if (lastRow) { // checks if the last row exists
		const cells = lastRow.querySelectorAll("td");
		const lastRecord = [];
		for (const cell of Array.from(cells)) {
			lastRecord.push(cell.textContent || "");
		}
		const lastID = parseFloat(lastRecord[0]); // determines te value in the last row
		if (0 <= lastID && lastID <= (recordCount)) { // checks if the last value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			globalVars.firstNumber = lastID + 1; // calculates the first number of the page
			let calculatedRows = adjustRowsByScreenHeight();
			globalVars.lastNumber = globalVars.firstNumber + (calculatedRows - 1);// calculates the first number of the page
			await displayRecords(recordCount); // display the new records
		}
	}
}

async function leftArrow(): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	const firstRow = document.querySelector("#recordsTable tbody .row:first-child"); // retrieves the first row
	if (firstRow) { // checks if the first row exists
		const cells = firstRow.querySelectorAll("td");
		const firstRecord = [];
		for (const cell of Array.from(cells)) {
			firstRecord.push(cell.textContent || "");
		};
		const firstID = parseFloat(firstRecord[0]); // determines te value in the first row
		if (0 <= firstID && firstID <= (recordCount)) { // checks if the first value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			const calculatedRows = adjustRowsByScreenHeight();
			globalVars.lastNumber = firstID - 1; // calculates the last number of the page
			globalVars.firstNumber = globalVars.lastNumber - (calculatedRows - 1); // uses the last number to calculate
			await displayRecords(recordCount);
		}
	}
}

window.onload = () => {
	createTable();
	displayRecords(recordCount);
	$('#btnSearch').on("click", async (event) => {
		event.preventDefault();
		let inputValue = $('#searchInput').val() as number;
		$('#page').empty();
		await updateRecordsAndResize(inputValue); // calls to calculate the range once button is clicked
	})
	$('#closeModalBtn').on("click", () => {
		$('.content').empty();
		$('.modal').css('display', 'none'); // closes modal
	})
	$('.arrow-right').on('click', () => {
		rightArrow();
	})
	$('.arrow-left').on('click', () => {
		leftArrow();
	})
	$('#searchInput').on('keydown', (event) => {
		if (event.key === 'e' || event.key === 'E') {
			event.preventDefault();
		}
	})
	$('#searchInput').on('input', (event) => {
		const inputValue = $('#searchInput').val() as string;
		if (inputValue.includes('.')) {
			$('#searchInput').val(inputValue.replace('.', ''));
		}
	})
}
