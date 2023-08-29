import { ajax, css } from "jquery";
let firstNumber = 0;
let lastNumber = 0;
let backend: string = "http://localhost:2050";

async function fetchRecordCount(): Promise<number> {
	try {
		const response = await fetch(`${backend}/recordCount`);
		if (!response.ok) {
			throw new Error('Failed to fetch record count');
		}
		return response.json()
	} catch (error) {
		console.error('Error fetching the record count:', error);
		throw error;
	};
};

async function fetchColumns(): Promise<string[]> {
	try {
		const response = await fetch(`${backend}/columns`);
		if (!response.ok) {
			throw new Error('Failed to fetch columns');
		}
		const jsonText = await response.text();
		const columns: string[] = await JSON.parse(jsonText);
		return columns
	} catch (error) {
		console.error('Error fetching columns', error)
		throw error
	};
};

async function createTable() {
	try {
		const columns = await fetchColumns()
		for (const col of columns) {
			$(".head").append(`<th>${col}</th>`);
		}
	} catch (error) {
		console.error('Error creating table', error)
	};
};
createTable()

function adjustRowsByScreenHeight() {
	const screenHeight = window.innerHeight;
	const availableHeight = screenHeight - 105; // subtracts the space used from the screeen
	let rowHeight = 35;
	if (availableHeight <= 0) {
		return 0;
	} else {
		let maxRows = Math.floor(availableHeight / rowHeight);
		return maxRows;
	};
};

$(window).on('resize', async () => {
	let resizeTimeout: number;
	resizeTimeout = setTimeout(async () => {
		$('#loader').show()
		await displayRecords()
		let inputValue = $('#searchInput').val(); // priotizes the search input value if available
		if (inputValue !== '') {
			await updateRecordsAndResize(Number(inputValue))
		}
		$('#loader').hide();
	}, 500);
});

async function fetchRecords(from: number, to: number): Promise<any[]> {
	try {
		const response = await fetch(`${backend}/records?from=${from}&to=${to}`);
		if (!response.ok) {
			throw new Error("Sorry, there's a problem with the network");
		}
		return response.json();
	} catch (error) {
		console.error('Error fetching records from server', error);
		throw error
	}
};

async function displayRecords(): Promise<void> {
	try {
		$('#loader').show()
		let count = await fetchRecordCount() - 1;
		let calculatedRows = adjustRowsByScreenHeight();
		const inputValue = $('#searchInput').val() as number;
		if (calculatedRows === 0) {
			lastNumber = firstNumber
		} else if (firstNumber < 0) {
			firstNumber = 0;
			lastNumber = firstNumber + (calculatedRows - 1);
		} else {
			lastNumber = firstNumber + (calculatedRows - 1);
		}
		let records;
		if (lastNumber <= count && lastNumber >= 0) {
			records = await fetchRecords(firstNumber, lastNumber);
			$('#page').empty();
			$('#page').append(`Showing record: ${firstNumber} - ${lastNumber}`); // changes the record range showing
			$('#loader').hide()
		} else {
			firstNumber = count - (calculatedRows - 1)
			lastNumber = count;
			records = await fetchRecords(firstNumber, count);
			$('#page').empty();
			$('#page').append(`Showing record: ${firstNumber} - ${count}`);
			$('#loader').hide()
		};
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
	} catch (error) {
		console.error("Error displaying records:", error);
	};
};
displayRecords()

async function updateRecordsAndResize(inputValue: number) {
	let count = await fetchRecordCount() - 1;
	if (inputValue < 0 || inputValue > count) { // check if the search input 
		$('.modal').css('display', 'block') //opens modal if search input is not within range
		$('.content').append(`<p>${inputValue} is not a number within the range.Please try a different number</p>`)
		$('#searchInput').val(''); // empties search bar
		return;
	}
	let calculatedRows = adjustRowsByScreenHeight();
	const halfRange = Math.floor(calculatedRows / 2); // divides the calculated max rows in half 
	firstNumber = Math.max(0, inputValue - halfRange);
	lastNumber = Math.min(count, firstNumber + (calculatedRows - 1));
	await displayRecords();
};

$('#closeModalBtn').on("click", () => {
	$('.content').empty()
	$('.modal').css('display', 'none') // closes modal
});

$('#btnSearch').on("click", async (event) => {
	event.preventDefault();
	try {
		let inputValue = $('#searchInput').val() as number;
		await updateRecordsAndResize(inputValue); // calls to calculate the range once button is clicked
	} catch (error) {
		console.error('An error occurred:', error);
	}
});

async function rightArrow(): Promise<void> {
	$('#searchInput').val('')
	const lastRow = document.querySelector("#recordsTable tbody .row:last-child"); // retrieves the last row
	let count = await fetchRecordCount() - 1;
	if (lastRow) { // checks if the last row exists
		const cells = lastRow.querySelectorAll("td");
		const lastRecord = [];
		for (const cell of Array.from(cells)) {
			lastRecord.push(cell.textContent || "");
		}
		const lastID = parseFloat(lastRecord[0]); // determines te value in the last row
		if (0 <= lastID && lastID <= (count)) { // checks if the last value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			firstNumber = lastID + 1; // calculates the first number of the page
			let calculatedRows = adjustRowsByScreenHeight();
			lastNumber = firstNumber + (calculatedRows - 1) // calculates the first number of the page
			await displayRecords(); // display the new records
		};
	};
};

async function leftArrow(): Promise<void> {
	$('#searchInput').val('')
	let count = await fetchRecordCount() - 1;
	const firstRow = document.querySelector("#recordsTable tbody .row:first-child"); // retrieves the first row
	if (firstRow) { // checks if the first row exists
		const cells = firstRow.querySelectorAll("td");
		const firstRecord = [];
		for (const cell of Array.from(cells)) {
			firstRecord.push(cell.textContent || "");
		}
		const firstID = parseFloat(firstRecord[0]); // determines te value in the first row
		if (0 <= firstID && firstID <= (count)) { // checks if the first value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			const calculatedRows = adjustRowsByScreenHeight();
			lastNumber = firstID - 1; // calculates the last number of the page
			firstNumber = lastNumber - (calculatedRows - 1) // uses the last number to calculate
			await displayRecords();
		};
	};
};
