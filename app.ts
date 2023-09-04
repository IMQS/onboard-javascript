const globals = globalInitializer();
let isFunctionRunning = false;

// The following would handle all the variable properties that is being changed a lot
function globalInitializer() {
	return {
		currentPage: 1,
		firstPage: 1,
		lastPage: 10,
		currentFromID: 1,
		currentToID: 20,
		difference: 0,
	};
}

class ApiManager {
	private mainUrl: string;
	constructor(mainUrl: string) {
		this.mainUrl = mainUrl;
	}
	private async fetchJson(mainUrl: string): Promise<any> {
		try {
			const response = await fetch(mainUrl);
			const data = JSON.parse(await response.text());
			return data;
		} catch (error) {
			throw error;
		}
	}
	// This function  will handle retrieving the records from the api
	getRecords(fromID: number, toID: number): Promise<string[][]> {
		const url = `${this.mainUrl}records?from=${fromID}&to=${toID}`;
		return this.fetchJson(url);
	}

	// This function  will handle retrieving the columns from the api
	getColumns(): Promise<string[]> {
		const url = `${this.mainUrl}columns`;
		return this.fetchJson(url);
	}

	// This function  will handle retrieving the record count from the api
	getRecordCount(): Promise<number> {
		const url = `${this.mainUrl}recordCount`;
		return this.fetchJson(url);
	}
}
const apiManager = new ApiManager("http://localhost:2050/");

// This function will loop through and display the appropriate columns in the correct order.
async function showColumns(): Promise<void> {
	try {
		$(".head-row").empty();
		let columns = await apiManager.getColumns();
		for (let i = 0; i < columns.length; i++) {
			$("thead").append(`<th>${columns[i]}</th>`);
		}
	} catch (error) {
		throw error;
	}
}

// This function will loop through and display the records on the table.
async function showRecords(fromID: number, toID: number): Promise<void> {
	if (isFunctionRunning) {
		isFunctionRunning = false;
		return;
	}
	isFunctionRunning = true;
	try {
		let count = await apiManager.getRecordCount();
		let inputNumber = input();
		const maxRecords = recordsPerPage();
		let condition = Math.ceil(count / maxRecords);
		$("tbody").empty();
		loader();
		globals.currentToID = toID;
		if (toID >= count) {
			toID = count;
			fromID = toID - (maxRecords - 1);
		} else if (globals.currentPage === 1) {
			fromID = 1;
		};
		let records = await apiManager.getRecords(fromID, toID);
		let stringCount = count.toLocaleString().replace(/,/g, " ");
		$('.results').empty().append(`Displaying ID's ${fromID} - ${toID} out of ${stringCount}`);
		for (let i = 0; i < records.length; i++) {
			$("tbody").append(`<tr class="body-row">`);
			for (let n = 0; n < records[i].length; n++) {
				$(".body-row:last-child").append(`<td><span>${records[i][n]}</span></td>`);
			}
			$("tbody").append(`</tr>`);
		};

		$("span").each(function () {
			const lowercasedID = $(this).text();
			if (lowercasedID == inputNumber) {
				$(this).css({ "background-color": "#FFFF00", "color": "black  " });
			} else {
				$(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
			}
		});

		if (condition >= fromID && condition <= toID) {
			$(".next").css({ display: "none" });
		}
	} catch (error) {
		throw error;
	}
	isFunctionRunning = false;
}

// The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
async function pageNumbers(start: number, end: number): Promise<void> {
	try {
		$('.pagination').empty();
		let count = await apiManager.getRecordCount();
		let stringCount = count.toLocaleString().replace(/,/g, " ");
		let maxRecords = recordsPerPage();
		let condition = Math.floor(count / maxRecords) + 1;
		if (condition <= end && condition >= start) {
			if (999999 % maxRecords === 0) {
				end = (condition - 1);
			} else {
				end = condition;
			}
			$(".next").css({ display: "none" });
		} else {
			$(".next").css({ display: "block" });
		}
		if (start < 1) {
			start = 1;
		}
		globals.firstPage = start;
		globals.lastPage = end;
		for (let i = start; i <= end; i++) {
			$(".pagination").append(
				`<a id="${i}" class="pagination-item">${i}</a>`
			);
		}
		if (globals.firstPage === 1) {
			$(".prev").css({ display: "none" });
		} else {
			$(".prev").css({ display: "block" });
		}

		// Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.
		$(".pagination-item").on("click", async function dynamicPagination() {
			if (isFunctionRunning) {
				return;
			}
			isFunctionRunning = true;
			$('.search-input').val('');
			globals.currentPage = parseInt($(this).attr("id") as any);
			const maxRecords = recordsPerPage();
			let fromID = Math.ceil(globals.currentPage * maxRecords - (maxRecords - 1));
			if (globals.difference > 0 && globals.difference < maxRecords) {
				fromID = fromID + globals.difference;
			}
			if (globals.currentPage === 1) {
				globals.currentFromID = 1;
			}
			let toID = fromID + (maxRecords - 1);
			if (fromID > count + 1 || toID > count + 1) {
				toID = count;
				fromID = toID - maxRecords;
				globals.currentFromID = fromID;
			}
			globals.currentFromID = fromID;
			$(".pagination-item").removeClass("active");
			$(this).addClass("active");
			isFunctionRunning = false;
			await showRecords(fromID, toID);
			return [fromID, toID];
		});

		$(".pagination-item").each(function () {
			let elementID = $(this).attr('id') as string;
			let currentPageString = globals.currentPage.toString();
			if (elementID == currentPageString) {
				$(this).addClass('active');
			}
		});

	} catch (error) {
		throw error;
	}
	isFunctionRunning = false;

	// Adding a click event to the next button of the pagination.
	$(".next").on("click", async function () {
		if (isFunctionRunning) {
			return;
		}
		isFunctionRunning = true;
		globals.firstPage = globals.lastPage + 1;
		globals.lastPage = globals.firstPage + 9;
		$(".pagination").empty();
		await pageNumbers(globals.firstPage, globals.lastPage);
		isFunctionRunning = false;
	});

	// Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
	$(".prev").on("click", async function () {
		if (isFunctionRunning) {
			return;
		}
		isFunctionRunning = true;
		globals.lastPage = globals.firstPage - 1;
		globals.firstPage = globals.lastPage - 9;
		$(".pagination").empty();
		await pageNumbers(globals.firstPage, globals.lastPage);
		isFunctionRunning = false;
	});
}

// Event listener to prevent some characters to be entered in the input
$('.search-input').on('keydown', function (e) {
	if (e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+' || e.key === '*' || e.key === '-') {
		e.preventDefault();
	}
	if (e.key === 'Enter') {
		$('.results-box').trigger('click');
	}
});

// In this function wil do the extract the number entered in the search. Then it would take that and calculate the range which should be displayed for the user to click on. 
$(".search-input").on("input", async function (this: HTMLInputElement, event: any) {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	event.preventDefault();
	let count = await apiManager.getRecordCount();
	let inputNumber = input();
	let inputNumberInt: any = parseInt(inputNumber);
	if (inputNumber !== '') {
		const maxRecords = recordsPerPage();
		let end = Math.ceil(inputNumberInt / maxRecords) * maxRecords;
		if (end > (count + 1)) {
			end = count;
			globals.currentToID = end;
		}
		let start = (end - (maxRecords - 1));
		globals.currentPage = Math.floor(end / maxRecords);
		if (inputNumberInt < 1000000 && inputNumberInt > 0) {
			if (end === 1000000) {
				end = end - 1;
			} else {
				null;
			}
			$('.results-box').remove();
			$('.search-container').append(`
				<div class="results-box">
					<p class="results-select">${start} - ${end}</p>
				</div>`);
			$('.results-box').on('click', resultsSelect);
		} else {
			$('.results-box').remove();
			$('.search-container').append(`
				<div class="results-box">
					<p class="message">Invalid Input!</p>
				</div>`);
		}
	} else {
		$('.results-box').remove();
	}

	isFunctionRunning = false;
});

// After the range has been returned to the user. The user can click on it and that will show the range of records on the table. 
async function resultsSelect(event: any) {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	let count = await apiManager.getRecordCount();
	let idRange = $('.results-select').text();
	let rangeArray = null;
	rangeArray = idRange.split('-');
	$('.results-box').remove();
	let startID = parseInt(rangeArray[0]);
	let endID = parseInt(rangeArray[1]);
	let maxRecords = recordsPerPage();
	globals.currentPage = Math.ceil(endID / maxRecords);
	let pageEnd = Math.ceil(globals.currentPage / 10) * 10;
	let pageStart = pageEnd - 9;
	if (endID === count) {
		startID = ((globals.currentPage - 1) * maxRecords) + 1;
		endID = count;
		globals.firstPage = pageStart;
		globals.lastPage = pageEnd;
	}
	await pageNumbers(pageStart, pageEnd);
	await showRecords(startID, endID);
}

// When adjusting the height and on different screen sizes. This function would responsible for calculating how much records should be displayed based on the height of the window itself. 
async function adjustDisplayedRecords() {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	try {
		let screenHeight = $(window).height() as number;
		if (screenHeight < 68) {
			screenHeight = 68;
		}
		let count = await apiManager.getRecordCount();
		let maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
		let inputNumber = input();
		let length = inputNumber.length as number;
		let inputNumberInt = parseInt(inputNumber);
		if (inputNumber === '') {
			let newCurrentPage = Math.ceil(globals.currentFromID / maxRecords);
			if (newCurrentPage === 1) {
				globals.currentFromID = 1;
			}
			globals.currentToID = globals.currentFromID + (maxRecords - 1);
			globals.currentPage = newCurrentPage;
			let originalID = (Math.floor(maxRecords * globals.currentPage) - (maxRecords - 1));
			globals.difference = globals.currentFromID - originalID;
		} else {
			if (length > 0) {
				let newCurrentPage = Math.ceil(inputNumberInt / maxRecords);
				if (globals.currentToID > count) {
					globals.currentToID = count;
				}
				globals.currentToID = newCurrentPage * maxRecords;
				globals.currentPage = newCurrentPage;
				globals.currentFromID = (globals.currentPage - 1) * maxRecords + 1;
			}
		};
		let pageEnd = Math.ceil(Math.floor(globals.currentToID / maxRecords) / 10) * 10;
		let pageStart = pageEnd - 9;
		globals.firstPage = pageStart;
		globals.lastPage = pageEnd;
		$("tbody").empty();
		isFunctionRunning = false;
		await showRecords(globals.currentFromID, globals.currentToID);
		await pageNumbers(pageStart, pageEnd);
		return maxRecords;
	} catch (error) {
		throw error;
	}
}

// Calls the function to resize with a timeout added for precision
let resizeTimer: ReturnType<typeof setTimeout>;
function resize() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(async () => {
		await adjustDisplayedRecords();
	}, 250);
}

// Just a loader to display when the table is empty and records is being fetched. 
function loader() {
	let content = $('tbody').text();
	if (content === '') {
		$('.results').append('<div class="loader"></div>');
	} else {
		$('.loader').css({ 'display': 'none' });
	}
}

// Calculate how many records should be displayed on the screen height
function recordsPerPage(): number {
	const screenHeight = $(window).height();
	const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
	return maxRecords;
}

// Retrieve the input value while a value is in the search bar
function input(): string {
	let inputNumber = $('.search-input').val() as string;
	return inputNumber;
}

// First function that runs when the  web app is started
window.onload = () => {
	showColumns();
	adjustDisplayedRecords();
	$(window).on('resize', resize);
}
