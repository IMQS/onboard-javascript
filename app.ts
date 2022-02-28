
const state = {
	'page': 1,
	'records': Math.ceil(window.innerHeight / 60),
	'window': 10
}

let RECORDCOUNT = 350
let HEADERS = ["ID", "City", "Population"]

function el(element: string) {
	return document.getElementById(element)
}

async function getData() {
	// API calls for record count and headers
	RECORDCOUNT = await (await fetch('/recordCount')).json()
	HEADERS = await (await fetch('/columns')).json()
	console.log("Changed to ", RECORDCOUNT, " and ", HEADERS)
	loadIntoTable(document.querySelector("table"))
}


// Bind to the resize event of the window object
window.addEventListener('resize', function (event) {
	var newHeight = window.innerHeight;
	state.records = Math.ceil(1000000 / newHeight)
	console.log(state.records)
})

// Search ID function
async function searchFunction() {
	let id = Number($('#id-search').val())

	let numRecords = RECORDCOUNT

	if (id < 0 || id > numRecords || Number.isNaN(id)) {
		// User info: Display error message
		let pageInfo = el('page-number')
		pageInfo!.innerHTML = `<p>No records to display</p>`
	}
	else {
		// Use entered ID to calculate what page it is on
		let pageNum = Math.ceil((id + 1) / state.records)

		// Set page to the one that the searched ID is on
		state.page = pageNum

		loadIntoTable(el("table"))
	}
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
	// TODO: Create a global get element function
	let pageDet = el('page-details')
	pageDet!.innerHTML = `<p>There are <strong>${recordCount + 1}</strong> records and <strong>${pages}</strong> pages</p>`

	return {
		'data': tableData,
		'pages': pages
	}
}

// Create paging buttons functions
function pageButtons(pages: number) {
	// User info: Display current page number
	let pageNum = el('page-number')
	pageNum!.innerHTML = `<p>Page ${state.page}</p>`

	// Select element to create pagination buttons in
	let wrapper = el('pagination-wrapper')
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

		loadIntoTable(el("table"))

	})
}

// Load json data into table function
async function loadIntoTable(table: any) {

	console.log("Records: ", RECORDCOUNT, " Headers: ", HEADERS)
	// Display loader
	$(".content").fadeOut(500);
	$(".loader").fadeIn(500);

	// Select table elements to populate
	let tableHead = table.querySelector("thead")
	let tableBody = table.querySelector("tbody")

	let cnumRecords = RECORDCOUNT - 1
	let hearders = HEADERS

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
	getData()
}
