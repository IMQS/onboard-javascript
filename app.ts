let api: string = "http://localhost:2050/";
let isFunctionRunning = false;
let currentPage = 1;
let firstPage = 1
let lastPage = firstPage + 9
let currentFromID = 1;
let currentToID = 20;
let difference = 0


// This function  will handle retrieving the records from the api
async function getRecords(fromID: number, toID: number): Promise<Array<Array<string>>> {
	try {
		const data = await fetch(`${api}records?from=${fromID}&to=${toID}`);
		const records: Array<Array<string>> = await data.json();
		return records;

	} catch (error) {
		console.error(error);
		throw error;
	}
}

// This function  will handle retrieving the columns from the api
async function getColumns(): Promise<Array<string>> {
	try {
		const data = await fetch(`${api}columns`);
		const columns: Array<string> = await data.json();
		return columns;

	} catch (error) {
		console.error(error);
		throw error;
	}
}

// This function  will handle retrieving the record count from the api
async function getRecordCount(): Promise<number> {
	try {
		const data = await fetch(`${api}recordCount`);
		const count: number = await data.json();
		return count;

	} catch (error) {
		console.error(error);
		throw error;
	}
}

// This function will loop through and display the appropriate columns in the correct order.
async function showColumns(): Promise<void> {
	try {
		$(".head-row").empty();
		let columns = await getColumns();
		for (let i = 0; i < columns.length; i++) {
			$("thead").append(`<th>${columns[i]}</th>`);
		}

	} catch (error) {
		console.error(error);
		throw error;
	}
}

// This function will loop through and display the records on the table.
async function showRecords(fromID: number, toID: number): Promise<void> {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	let inputNumber: string = $('.search-input').val() as string
	const screenHeight = $(window).height();
	const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
	let condition = Math.ceil(999999 / maxRecords) + 1
	if ((condition - 1) == currentPage) {
		fromID = (condition - 2) * maxRecords + 1
	}
	// if(inputNumber == "") {
	//   currentFromID = fromID
	// } 
	try {
		$("tbody").empty();
		loader()
		currentToID = toID
		if (toID > 999999) {
			toID = 999999
		} else if (currentPage == 1) {
			fromID = 1
		}
		let records = await getRecords(fromID, toID);
		let count: number = await getRecordCount();
		let stringCount = count.toLocaleString().replace(/,/g, " ");
		$('.results').empty().append(`Displaying ID's ${fromID} - ${toID} out of ${stringCount}`)
		for (let i = 0; i < records.length; i++) {
			$("tbody").append(`<tr class="body-row">`);
			for (let n = 0; n < records[i].length; n++) {
				$(".body-row:last-child").append(`<td><span>${records[i][n]}</span></td>`);
			}
			$("tbody").append(`</tr>`);
		}

		let inputNumber: string = $('.search-input').val() as string
		$("span").each(function () {
			const lowercasedID: string = $(this).text() as string;
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
		console.error(error);
		throw error;
	}
	isFunctionRunning = false;
}

// The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
async function pageNumbers(start: number, end: number): Promise<void> {
	try {
		$('.pagination').empty();
		let count: number = await getRecordCount();
		let stringCount = count.toLocaleString().replace(/,/g, " ");
		const screenHeight = $(window).height();
		let maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
		let condition = Math.floor(999999 / maxRecords) + 1;
		if (condition <= end && condition >= start) {
			if (999999 % maxRecords === 0) {
				end = (condition - 1)
			} else end = condition
			$(".next").css({ display: "none" });
		} else $(".next").css({ display: "block" });
		if (start < 1) {
			start = 1
		}
		firstPage = start;
		lastPage = end;
		for (let i = start; i <= end; i++) {
			$(".pagination").append(
				`<a id="${i}" class="pagination-item">${i}</a>`
			);
		}
		if (firstPage === 1) {
			$(".prev").css({ display: "none" });
		} else $(".prev").css({ display: "block" });


		// Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.
		$(".pagination-item").on("click", async function dynamicPagination(): Promise<Array<number>> {
			$('.search-input').val('')
			currentPage = parseInt($(this).attr("id") as any);
			const screenHeight = $(window).height();
			const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
			let pageNumber: any = $(this).attr("id");
			let fromID = Math.ceil(pageNumber * maxRecords - (maxRecords - 1));
			if (difference > 0 && difference < maxRecords) {
				fromID = fromID + difference
			}
			if (currentPage === 1) {
				currentFromID = 1
			}
			let toID = fromID + (maxRecords - 1)


			if (fromID > count || toID > count) {
				toID = count - 1;
				fromID = toID - maxRecords
				currentFromID = fromID
			}
			currentFromID = fromID
			$(".pagination-item").removeClass("active");
			$(this).addClass("active");
			showRecords(fromID, toID);
			$(".results").empty();
			$(".results").append(
				`Displaying ID's ${fromID} - ${toID} out of ${stringCount}`
			);
			return [fromID, toID]
		});

		$(".pagination-item").each(function () {
			let elementID = $(this).attr('id') as string;
			let currentPageString: string = currentPage.toString();
			if (elementID == currentPageString) {
				$(this).addClass('active')
			}
		});

	} catch (error) {
		console.error(error);
		throw error;
	}
	isFunctionRunning = false
}


// Adding a click event to the next button of the pagination.
$(".next").on("click", async function () {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true
	firstPage = lastPage + 1;
	lastPage = firstPage + 9;
	$(".pagination").empty();
	await pageNumbers(firstPage, lastPage);
	isFunctionRunning = false
});

// Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
$(".prev").on("click", async function () {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true
	lastPage = firstPage - 1;
	firstPage = lastPage - 9;
	$(".pagination").empty();
	await pageNumbers(firstPage, lastPage);
	// isFunctionRunning = false
});

// In this function wil do the extract the number entered in the search. Then it would take that and calculate the range which should be displayed for the user to click on. 
async function resultsRange(event: any) {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	event.preventDefault();
	let inputNumber: string = $('.search-input').val() as string
	let inputNumberInt = parseInt(inputNumber);
	if (inputNumber !== '') {
		const screenHeight = $(window).height();
		const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
		let end: number = Math.ceil(inputNumberInt / maxRecords) * maxRecords;
		if (end > 1000000) {
			end = 999999
			currentToID = end
		}
		let start: number = (end - (maxRecords - 1));
		currentPage = Math.floor(end / maxRecords);
		if (inputNumberInt < 1000000 && inputNumberInt > 0) {
			if (end === 1000000) {
				end = end - 1;
			} else null
			$('.results-box').remove()
			$('.search-container').append(`
                                    <div class="results-box">
                                      <p class="results-select">${start} - ${end}</p>
                                    </div>
                                    `)
			$('.results-box').on('click', resultsSelect)
		} else {
			$('.results-box').remove()
			$('.search-container').append(`
                                    <div class="results-box">
                                      <p class="message">Can't search negative values or records larger than 999 999 !!!</p>
                                    </div>
                                    `)
		}
	} else {
		$('.results-box').remove()
	}

	isFunctionRunning = false;
}
$(".search-input").on("keyup", resultsRange);

// After the range has been returned to the user. The user can click on it and that will show the range of records on the table. 
async function resultsSelect() {
	if (isFunctionRunning) {
		return;
	}
	isFunctionRunning = true;
	let idRange = $('.results-select').text();
	let rangeArray = null
	rangeArray = idRange.split('-');
	$('.results-box').remove()
	let startID = parseInt(rangeArray[0])
	let endID = parseInt(rangeArray[1])
	isFunctionRunning = false;
	const screenHeight = $(window).height();
	const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
	currentPage = Math.ceil(endID / maxRecords)
	let pageEnd = Math.ceil(currentPage / 10) * 10;
	let pageStart = pageEnd - 9

	if (endID == 999999) {
		startID = ((currentPage - 1) * maxRecords) + 1;
		endID = 999999
		firstPage = pageStart;
		lastPage = pageEnd
	}

	await pageNumbers(pageStart, pageEnd)
	await showRecords(startID, endID)

}

// When adjusting the height and on different screen sizes. This function would responsible for calculating how much records should be displayed based on the height of the window itself. 
async function adjustDisplayedRecords(): Promise<number> {
	let screenHeight = $(window).height() as number;
	if (screenHeight < 68) {
		screenHeight = 68
	}
	let maxRecords = Math.floor(parseInt(screenHeight as any) / 68);

	let inputNumber = $('.search-input').val() as string
	let length = inputNumber.length as number;
	let inputNumberInt = parseInt(inputNumber)

	if (inputNumber == '') {
		let newCurrentPage = Math.ceil(currentFromID / maxRecords);
		if (newCurrentPage === 1) {
			currentFromID = 1
		}
		currentToID = currentFromID + (maxRecords - 1);
		currentPage = newCurrentPage;
		let originalID = (Math.floor(maxRecords * currentPage) - (maxRecords - 1))
		difference = currentFromID - originalID
	} else {
		if (length > 0) {
			let newCurrentPage = Math.ceil(inputNumberInt / maxRecords)
			if (currentToID > 999999) {
				currentToID = 999999
			}
			currentToID = newCurrentPage * maxRecords;
			currentPage = newCurrentPage
			currentFromID = (currentPage - 1) * maxRecords + 1;
		}
	}
	let pageEnd = Math.ceil(Math.floor(currentToID / maxRecords) / 10) * 10;
	let pageStart = pageEnd - 9;
	firstPage = pageStart;
	lastPage = pageEnd;
	$("tbody").empty();
	await showRecords(currentFromID, currentToID);
	await pageNumbers(pageStart, pageEnd);
	return maxRecords;
}

let resizeTimer: ReturnType<typeof setTimeout>;

function resize() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(async () => {
		const maxRecords: number = await adjustDisplayedRecords();
	}, 800);
}

// Just a loader to display when the table is empty and records is being fetched. 
function loader() {
	let content = $('tbody').text();
	if (content == '') {
		$('.results').append('<div class="loader"></div>')
	} else {
		$('.loader').css({ 'display': 'none' })
	}
}


window.onload = () => {
	showColumns();
	// pageNumbers(1, 10);
	adjustDisplayedRecords();
	$(window).on('resize', resize);
};
