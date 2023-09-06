import { ajax, css } from "jquery";
class GlobalVariables {
	firstNumber = 0;
	lastNumber = 0;
	backend = "http://localhost:2050";
	resizeTimeout = 0;
	//fetches the number of records from localhost
	fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then((res) => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.text();
			})
			.then((data) => {
				return JSON.parse(data);
			})
			.catch((err) => {
				throw 'Error fetching the record count: ' + err;
			})
	}
	//fetches columns from localhost
	fetchColumns(): Promise<string[]> {
		return fetch(`${this.backend}/columns`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch columns';
				}
				return res.text();
			})
			.then((data) => {
				return JSON.parse(data);
			}).catch(err => {
				throw 'Error fetching columns' + err;
			})
	}
	//fetches records from localhost
	fetchRecords(from: number, to: number): Promise<any[]> {
		return fetch(`${this.backend}/records?from=${from}&to=${to}`)
			.then(res => {
				if (!res.ok) {
					throw "Sorry, there's a problem with the network";
				}
				return res.text();
			})
			.then((data) => {
				return JSON.parse(data);
			}).catch(err => {
				throw 'Error fetching records from server ' + err;
			})
	}
}

const globalVars = new GlobalVariables();
let recordCount: number;

globalVars.fetchRecordCount()
	.then((count) => {
		// Assign the fetched count to the variable
		recordCount = count - 1;
		displayRecords(recordCount);
	})
	.catch(err => {
		throw 'Error fetching record count' + err;
	})
//Initializes the table head
function createTable() {
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
//calculates the number of rows that can fit the screen
const adjustRowsByScreenHeight = (): number => {
	//retrieves screen height
	const screenHeight = window.innerHeight;
	//subtracts the space used from the screeen
	const availableHeight = screenHeight - 105;
	let rowHeight = 35;
	if (availableHeight <= 0) {
		return 0;
	} else {
		let maxRows = Math.floor(availableHeight / rowHeight);
		return maxRows;
	}
}
//calls to re-display records when screen is adjusted
$(window).on('resize', () => {
	clearTimeout(globalVars.resizeTimeout);
	globalVars.resizeTimeout = setTimeout(async () => {
		await displayRecords(recordCount);
		// priotizes the search input value if available
		let inputValue = $('#searchInput').val();
		if (inputValue !== '') {
			await updateRecordsAndResize(Number(inputValue));
		}
	}, 250)

})
//display records from first to last number
async function displayRecords(recordCount: number): Promise<void> {
	$('#loader').show();
	let calculatedRows = adjustRowsByScreenHeight();
	const inputValue = $('#searchInput').val() as number;
	const tbody = $("tbody");
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
					tbody.empty();
					for (const record of records) {
						// creates row for each record
						$("tbody").append(`<tr class="row"></tr>`);
						const lastRow = $(".row:last");
						for (const value of record) {
							// assign each record to their column in a specified row
							lastRow.append(`<td>${value}</td>`);
						}
						if (record.includes(inputValue)) {
							// highlights the searched row
							lastRow.css('background-color', '#DDC0B4');
						}
						$("tbody").append(lastRow);
					}
				})
				.catch((err) => {
					throw 'Error fetching records' + err;
				})
		} else {
			globalVars.firstNumber = recordCount - (calculatedRows - 1);
			globalVars.lastNumber = recordCount;
			return globalVars
				.fetchRecords(globalVars.firstNumber, recordCount)
				.then((records) => {
					$('#page').empty();
					$('#page').append(`Showing record: ${globalVars.firstNumber} - ${globalVars.lastNumber}`);
					$('#loader').hide();
					tbody.empty();
					for (const record of records) {
						// creates row for each record
						$("tbody").append(`<tr class="row"></tr>`);
						const lastRow = $(".row:last");
						for (const value of record) {
							//assign each record to their column in a specified row
							lastRow.append(`<td>${value}</td>`);
						}
						if (record.includes(inputValue)) {
							//highlights the searched row
							lastRow.css('background-color', '#DDC0B4');
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
	//check if the search input 
	if (inputValue < 0 || inputValue > recordCount) {
		//opens modal if search input is not within range
		$('.modal').css('display', 'block');
		$('.content').append(`<p>${inputValue} is not a number within the range. Please try a different number</p>`);
		//empties search bar
		$('#searchInput').val('');
		return
	}
	let calculatedRows = adjustRowsByScreenHeight();
	//divides the calculated max rows in half 
	const halfRange = Math.floor(calculatedRows / 2);
	globalVars.firstNumber = Math.max(0, inputValue - halfRange);
	globalVars.lastNumber = Math.min(recordCount, globalVars.firstNumber + (calculatedRows - 1));
	await displayRecords(recordCount);
}

async function rightArrow(): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	//retrieves the last row
	const lastRow = document.querySelector("#recordsTable tbody .row:last-child");
	// checks if the last row exists
	if (lastRow) {
		const cells = lastRow.querySelectorAll("td");
		const lastRecord = [];
		for (const cell of Array.from(cells)) {
			lastRecord.push(cell.textContent || "");
		}
		//determines te value in the last row
		const lastID = parseFloat(lastRecord[0]);
		// checks if the last value is within range
		if (0 <= lastID && lastID <= (recordCount)) {
			const tbody = $("tbody");
			//empties the table
			tbody.empty();
			//calculates the first number of the page
			globalVars.firstNumber = lastID + 1;
			let calculatedRows = adjustRowsByScreenHeight();
			// calculates the last number of the page
			globalVars.lastNumber = globalVars.firstNumber + (calculatedRows - 1);
			//display the new records
			await displayRecords(recordCount);
		}
	}
}

async function leftArrow(): Promise<void> {
	$('#page').empty();
	$('#searchInput').val('');
	//retrieves the first row
	const firstRow = document.querySelector("#recordsTable tbody .row:first-child");
	//checks if the first row exists
	if (firstRow) {
		const cells = firstRow.querySelectorAll("td");
		const firstRecord = [];
		for (const cell of Array.from(cells)) {
			firstRecord.push(cell.textContent || "");
		}
		//determines te value in the first row
		const firstID = parseFloat(firstRecord[0]);
		//checks if the first value is within range
		if (0 <= firstID && firstID <= (recordCount)) {
			const tbody = $("tbody");
			//empties the table
			tbody.empty();
			const calculatedRows = adjustRowsByScreenHeight();
			//calculates the last number of the page
			globalVars.lastNumber = firstID - 1;
			//uses the last number to calculate first number
			globalVars.firstNumber = globalVars.lastNumber - (calculatedRows - 1);
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
		//calls to calculate the range once button is clicked
		await updateRecordsAndResize(inputValue);
	})
	$('#closeModalBtn').on("click", () => {
		$('.content').empty();
		//closes modal
		$('.modal').css('display', 'none');
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
