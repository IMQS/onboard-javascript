
const state = {
	'page': 1,
	'records': 15,
	'window': 10
}

async function getData() {
	// API calls for record count and headers
	let numRecords = await (await fetch('/recordCount')).json()
	let headers = await (await fetch('/columns')).json()

	return {
		'recordCount': numRecords,
		'headers': headers
	}
}

// Search ID function
async function searchFunction() {
	let id = Number($('#id-search').val())

	// API calls for record amount
	let dataInfo = getData()
	let numRecords = (await dataInfo).recordCount - 1

	if (id < 0 || id > numRecords || Number.isNaN(id)) {
		// User info: Display error message
		let pageInfo = document.getElementById('page-number')
		pageInfo!.innerHTML = `<p>No records to display</p>`
	}
	else {
		// Use entered ID to calculate what page it is on
		let pageNum = Math.ceil((id + 1) / state.records)

		// Set page to the one that the searched ID is on
		state.page = pageNum

		loadIntoTable(document.querySelector("table"))
	}
}

// Select num records to display from drop down function
function dropFunction() {
	// Get value selected in drop down and reload table
	let num = Number($('#show-by').val())
	state.records = num
	loadIntoTable(document.querySelector("table"))
}

// Records to display in table function
async function pagination(recordCount: number, page: number, records: number) {
	let pages = Math.ceil(recordCount / records)

	// Calculate where records to display should start and end
	let trimStart = (page - 1) * records
	let trimEnd: number
	if (page != pages) {
		trimEnd = trimStart + records - 1
	}
	else {
		trimEnd = recordCount
	}

	// Fetch only records that must be displayed on table
	let recordsLink = "/records?from=" + trimStart + "&to=" + trimEnd
	let tableData = await (await fetch(recordsLink)).json()


	// User info: Display number of records and pages on window
	// TODO: create a global get element function
	let pageDet = document.getElementById('page-details')
	pageDet!.innerHTML = `<p>There are <strong>${recordCount + 1}</strong> records and <strong>${pages}</strong> pages</p>`

	return {
		'data': tableData,
		'pages': pages
	}
}

// Create paging buttons functions
function pageButtons(pages: number) {
	// User info: Display current page number
	let pageNum = document.getElementById('page-number')
	pageNum!.innerHTML = `<p>Page ${state.page}</p>`

	// Select element to create pagination buttons in
	let wrapper = document.getElementById('pagination-wrapper')
	wrapper!.innerHTML = ""

	let maxLeft = (state.page - Math.floor(state.window / 2))
	let maxRight = (state.page + Math.floor(state.window / 2))

	// Button numbers must not go below 1
	if (maxLeft < 1) {
		maxLeft = 1
		maxRight = state.window
	}

	// Button numbers cannot exceed max number of pages
	if (maxRight > pages) {
		maxLeft = pages - (state.window - 1)
		maxRight = pages

		if (maxLeft < 1) {
			maxLeft = 1
		}
	}

	// Create buttons
	for (let page = maxLeft; page <= maxRight; page++) {
		wrapper!.innerHTML += `<button value=${page} class="page btn">${page}</button>`
	}

	// If the current page is not 1 -> add '<< First' button
	if (state.page != 1) {
		wrapper!.innerHTML = `<button value=${1} class="page btn">&#171; First</button>` + wrapper!.innerHTML
	}

	// If the current page is not the last page -> add 'Last >>' button
	if (state.page != pages) {
		wrapper!.innerHTML += `<button value=${pages} class="page btn">Last &#187;</button>`
	}

	$('.page').on('click', function () {

		state.page = Number($(this).val())

		loadIntoTable(document.querySelector("table"))

	})
}

// Load json data into table function
async function loadIntoTable(table: any) {
	// Display loader
	$(".content").fadeOut(500);
	$(".loader").fadeIn(500);

	// Select table elements to populate
	let tableHead = table.querySelector("thead")
	let tableBody = table.querySelector("tbody")

	// API calls for record amount
	let dataInfo = getData()
	let cnumRecords = (await dataInfo).recordCount - 1
	let hearders = (await dataInfo).headers

	let rows = pagination(cnumRecords, state.page, state.records)

	// Clear the table
	tableHead.innerHTML = "<tr></tr>"
	tableBody.innerHTML = ""

	// Populate the headers
	for (let headerText of hearders) {
		let headerElement = document.createElement("th")

		headerElement.textContent = headerText;
		tableHead.querySelector("tr").appendChild(headerElement)
	}

	// Populate the rows
	for (let row of (await rows).data) {
		let rowElement = document.createElement("tr")

		for (let cellText of row) {
			let cellElement = document.createElement("td")

			cellElement.textContent = cellText
			rowElement.appendChild(cellElement);
		}

		tableBody.appendChild(rowElement)
	}
	pageButtons((await rows).pages)

	// Display content
	$(".loader").fadeOut(500);
	$(".content").fadeIn(500);
}

window.onload = () => {
	loadIntoTable(document.querySelector("table"))
}
