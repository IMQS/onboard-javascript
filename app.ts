import { ajax, css } from "jquery";

const myClass = new Myclass();

/** Initializes the table head */
function createTable(): Promise<string[]> {
	return myClass.fetchColumns()
		.then(columns => {
			for (const col of columns) {
				$(".head").append(`<th>${col}</th>`);
			}
			return columns;
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
		myClass.resizeTimeout = setTimeout(() => {
			displayRecords(recordCount)
				.then(() => {
					let inputValue = $('#searchInput').val();
					if (inputValue !== '') {
						return searchRecordsAndResize(recordCount);
					}
				})
				.catch(err => {
					throw new Error('Error occured while resizing' + err);
				});
		}, 250);
	});
}

/** display records that fit the screen */
function displayRecords(recordCount: number): Promise<any[]> {
	$('#loader').show();
	const inputValue = $('#searchInput').val() as number;
	const calculatedRows = calculatingRows();
	const { firstNumber, lastNumber } = calculateFirstAndLastNumbers(calculatedRows, recordCount);
	updateArrowVisibility(firstNumber, lastNumber, recordCount);
	return fetchAndDisplayRecords(firstNumber, lastNumber, inputValue)
		.then(records => {
			$('#page').empty().append(`Showing record: ${firstNumber} - ${lastNumber}`);
			$('#loader').hide();
			return records;
		}).catch(err => {
			throw new Error('Error displaying records' + err);
		});
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
		firstNumber = lastNumber - (calculatedRows - 1);
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

function fetchAndDisplayRecords(firstNumber: number, lastNumber: number, inputValue: number) {
	return myClass.fetchRecords(firstNumber, lastNumber)
		.then(records => {
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
		})
		.catch(err => {
			throw new Error('Error fetching records' + err);
		});
}

/** recalculates the record range that includes inputValue */
function searchRecordsAndResize(recordCount: number) {
	let inputValue = $('#searchInput').val() as number;
	if (inputValue < 0 || inputValue > recordCount) {
		$('.modal').css('display', 'block');
		$('.content').append(`<p>${inputValue} is not a number within the range. Please try a different number</p>`);
		$('#page').empty().append(`Showing record: ${myClass.firstNumber} - ${myClass.lastNumber}`);
		$('#searchInput').val('');
		return;
	}
	let calculatedRows = calculatingRows();
	/** divides the calculated max rows in half*/
	const halfRange = Math.floor(calculatedRows / 2);
	myClass.firstNumber = Math.max(0, inputValue - halfRange);
	myClass.lastNumber = Math.min(recordCount, myClass.firstNumber + (calculatedRows - 1));
	displayRecords(recordCount);
}

/** Navigates to the next set of records */
function rightArrow(recordCount: number) {
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
		if (0 <= lastID && lastID <= recordCount) {
			$("tbody").empty();
			/** calculates the first number of the page */
			myClass.firstNumber = lastID + 1;
			let calculatedRows = calculatingRows();
			/** calculates the last number of the page */
			myClass.lastNumber = myClass.firstNumber + (calculatedRows - 1);
			displayRecords(recordCount);
		}
	}
}

function leftArrow(recordCount: number) {
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
		if (0 <= firstID && firstID <= recordCount) {
			$("tbody").empty();
			const calculatedRows = calculatingRows();
			myClass.lastNumber = firstID - 1;
			myClass.firstNumber = myClass.lastNumber - (calculatedRows - 1);
			displayRecords(recordCount);
		}
	}
}

window.onload = () => {
	createTable();
	myClass.fetchRecordCount()
		.then(count => {
			let recordCount: number = count - 1;
			displayRecords(recordCount);
			handleResize(recordCount);
			searchRecordsAndResize(recordCount);
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
			throw new Error('Error fetching record' + err);
		});
	$('#closeModalBtn').on("click", () => {
		$('.content').empty();
		$('.modal').css('display', 'none');
	});
	$('#searchInput').on('keydown', (event) => {
		if (event.key === 'e' || event.key === 'E') {
			event.preventDefault();
		}
	});
	$('#searchInput').on('input', () => {
		const inputValue = $('#searchInput').val() as string;
		if (inputValue.includes('.')) {
			$('#searchInput').val(inputValue.replace('.', ''));
		}
	});
}
