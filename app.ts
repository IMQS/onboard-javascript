import { ajax, css } from "jquery";
var firstNumber: number = 0;
var lastNumber: number;
var calculatedRows: number | null = null;
var count: number | null = null;

async function fetchRecordCount(): Promise<number> { // fetches the number of records from the server
	try {
		const recordCount = await fetch(`http://localhost:2050/recordCount`);
		if (!recordCount.ok) {
			throw new Error('Failed to fetch record count');
		}
		const data = await recordCount.json()
		return data;
	} catch (error) {
		console.error('Error fetching the record count:', error);
		throw error;
	}
}

function fetchColumns(): void { //fetches the different columns headings from server
	fetch("http://localhost:2050/columns")
		.then((response: Response) => {
			return response.json() as Promise<string[]>;
		})
		.then((columns: string[]) => {
			const colArray = columns; // assigns the columns to an array

			for (let c = 0; c < colArray.length; c++) {
				$(".head").append(`<th>${colArray[c]}</th>`); // creates a single column for each heading
			}
		})
}
fetchColumns()

async function adjustRowsByScreenHeight(): Promise<number> { // calculates the number of rows that can fit the screen
	const screenHeight = window.innerHeight; // calculates screen height
	const availableHeight = screenHeight - 105 // subtracts the space used from the screeen
	let rowHeight = 35
	if (availableHeight <= 0) {
		return 0;
	} else {
		let maxRows = Math.floor(availableHeight / rowHeight);
		return maxRows; // returns the maximum rows that can fit into screen
	}
}

let resizeTimeout: number;
$(window).on('resize', async () => {
	clearTimeout(resizeTimeout); // cancel previously schedule Timeout

	resizeTimeout = setTimeout(async () => {
		$('#loader').show()
		calculatedRows = await adjustRowsByScreenHeight(); // to recalcualte the number of max rows
		await displayRecords()

		let inputValue = $('#searchInput').val(); // priotizes the search input value if available
		if (inputValue !== '') {
			await updateRecordsAndResize(Number(inputValue))
		}
		$('#loader').hide();
	}, 500);
})

async function fetchRecords(from: number, to: number): Promise<any[]> { // fetches records from specified number to a certain number
	const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
	if (!response.ok) {
		throw new Error("Sorry, there's a problem with the network");
	}
	return response.json();
}

async function displayRecords(): Promise<void> { //displays records from firstNumber to lastNumber
	try {
		$('#loader').show()
		count = await fetchRecordCount() - 1;
		calculatedRows = await adjustRowsByScreenHeight();
		const inputValue = $('#searchInput').val() as number;
		if (calculatedRows === 0) {
			lastNumber = firstNumber

		}
		if (!lastNumber) {
			lastNumber = firstNumber + (calculatedRows - 1);
		}
		if (firstNumber < 0) {
			firstNumber = 0;
			lastNumber = firstNumber + (calculatedRows - 1);
		}
		else {
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

		}


		const tbody = $("tbody");
		tbody.empty();
		for (let r = 0; r < records.length; r++) {
			$("tbody").append(`<tr class="row"></tr>`); // creates row for each record
			const lastRow = $(".row:last");
			for (let i = 0; i < records[r].length; i++) {
				lastRow.append(`<td>${records[r][i]}</td>`); //assign each record to their column in a specified row
			}
			if (records[r].includes(inputValue)) {

				lastRow.css('background-color', '#DDC0B4'); // hightlights the searched row

			}
			tbody.append(lastRow);
		}
	} catch (error) {
		console.error("Error displaying records:", error);
	}
}
displayRecords()

async function updateRecordsAndResize(inputValue: number) { // calulates the range of records according to the search input
	count = await fetchRecordCount() - 1;
	if (inputValue < 0 || inputValue > count) { // check if the search input 
		$('.modal').css('display', 'block') //opens modal if search input is not within range
		$('.modal-content').append(`<p>${inputValue} is not a number within the range.Please try a different number</p>`)
		$('#searchInput').val(''); // empties search bar
		return;
	}
	calculatedRows = await adjustRowsByScreenHeight();
	const quarterRange = Math.floor(calculatedRows / 2); // divides the calculated max rows in half 

	firstNumber = Math.max(0, inputValue - quarterRange);
	lastNumber = Math.min(count, firstNumber + (calculatedRows - 1));
	await displayRecords();
}
$('#closeModalBtn').on("click", () => {
	$('.modal').css('display', 'none') // closes modal
});
$('.btnSearch').on('click', async (event: any) => {
	event.preventDefault();
	let inputValue = $('#searchInput').val() as number;
	await updateRecordsAndResize(inputValue); // calls to calculate the range once button is clicked

});

async function rightArrow(): Promise<void> { // moves records to the next list 
	$('#searchInput').val('')
	const lastRow = document.querySelector("#recordsTable tbody .row:last-child"); // retrieves the last row
	count = await fetchRecordCount() - 1;
	if (lastRow) { // checks if the last row exists
		const cells = lastRow.querySelectorAll("td");
		const lastRecord: string[] = [];
		cells.forEach((cell) => {
			lastRecord.push(cell.textContent || "");
		});
		const lastID = parseFloat(lastRecord[0]); // determines te value in the last row
		if (0 <= lastID && lastID <= (count)) { // checks if the last value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			firstNumber = lastID + 1; // calculates the first number of the page
			calculatedRows = await adjustRowsByScreenHeight();
			lastNumber = firstNumber + (calculatedRows - 1) // calculates the first number of the page
			await displayRecords(); // display the new records
		}
	}
}

async function leftArrow(): Promise<void> { // moves records to the previous list 
	$('#searchInput').val('')
	count = await fetchRecordCount() - 1;
	const firstRow = document.querySelector("#recordsTable tbody .row:first-child"); // retrieves the first row
	if (firstRow) { // checks if the first row exists
		const cells = firstRow.querySelectorAll("td");
		const firstRecord: string[] = [];
		cells.forEach((cell) => {
			firstRecord.push(cell.textContent || "");
		});
		const firstID = parseFloat(firstRecord[0]); // determines te value in the first row
		if (0 <= firstID && firstID <= (count)) { // checks if the first value is within range
			const tbody = $("tbody");
			tbody.empty(); // empties the table
			const calculatedRows = await adjustRowsByScreenHeight();
			lastNumber = firstID - 1; // calculates the last number of the page
			firstNumber = lastNumber - (calculatedRows - 1) // uses the last number to calculate
			await displayRecords();
		}
	}
}
