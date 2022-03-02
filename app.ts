
let state = {
	'page': 1,
	'records': Math.floor((window.innerHeight - 160) / 40),
	'window': 10,
	'trimStart': 0,
	'trimEnd': 10,
	'countRec': 0
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

	// Populate table with fetched data
	loadIntoTable(document.querySelector("table"))
}


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
		console.log("Records for Id: ", state.records)
		let pageNum = Math.floor(id / state.records + 1)

		// Set page to the one that the searched ID is on
		state.page = pageNum

		loadIntoTable(el("table"))
	}
}

// Add rows to table
async function addRows(link: string) {
	let table = document.querySelector("table")
	let tableBody = table?.querySelector("tbody")
	let data = await (await fetch(link)).json();
	for (let row of data) {
		let rowElement = document.createElement("tr")
		state.countRec += 1

		for (let cellText of row) {
			let cellElement = document.createElement("td")

			cellElement.textContent = cellText
			rowElement.appendChild(cellElement);
		}
		tableBody?.appendChild(rowElement)
	}
}

// Delete rows from table
async function deleteRows(newHeight: number, diff: number) {
	let table = document.querySelector("table")
	let tableBody = table?.querySelector("tbody")
	let num = newHeight - 1

	for (let i = num; i > (num + diff); i--) {
		console.log("deleted a row")
		tableBody!.deleteRow(i)
	}

}

// Records to display in table function
async function pagination(recordCount: number, page: number, records: number) {
	let pages = Math.ceil((recordCount + 1) / records)

	// Calculate where displayed records should start and end
	state.trimStart = (page - 1) * records
	if (page != pages) {
		state.trimEnd = state.trimStart + records - 1
	}
	else {
		state.trimEnd = recordCount
	}

	// Fetch only records that must be displayed on table
	let recordsLink = "/records?from=" + state.trimStart + "&to=" + state.trimEnd

	state.countRec = 0
	addRows(recordsLink)


	// User info: Display current page number
	let pageNum = el('page-number')
	pageNum!.innerHTML = `<p>Page <strong>${state.page}</strong> of <strong>${pages}</strong> </p>`

	return {
		'pages': pages
	}
}

// Create paging buttons functions
function pageButtons(pages: number) {

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

	// Display loader
	$(".content").fadeOut(500);
	$(".loader").fadeIn(500);

	// Select table elements to populate
	let tableHead = table.querySelector("thead")
	let tableBody = table.querySelector("tbody")

	let cnumRecords = RECORDCOUNT - 1
	let hearders = HEADERS

	// Clear the table
	tableHead.innerHTML = "<tr></tr>"
	tableBody.innerHTML = ""

	// Populate the headers
	for (let headerText of hearders) {
		let headerElement = document.createElement("th")

		headerElement.textContent = headerText;
		tableHead.querySelector("tr").appendChild(headerElement)
	}

	// Add rows in pagination function
	let rows = pagination(cnumRecords, state.page, state.records)

	// Create pagination buttons
	pageButtons((await rows).pages)

	// Display content
	$(".loader").fadeOut(500);
	$(".content").fadeIn(500);
}

// Add/remove rows from table based on resize event of the window
window.addEventListener('resize', function () {
	// Calculate number rows to be added/deleted
	let newHeight = Math.floor((window.innerHeight - 160) / 40)
	let diff = newHeight - state.records

	let start = state.trimEnd + 1
	let end = state.trimEnd + diff
	let pages = Math.ceil(RECORDCOUNT / state.records)


	if (diff < 0 && state.countRec - 1 == newHeight && state.countRec != 1) {
		// Delete rows from last page
		deleteRows(state.countRec, diff)

		state.countRec = state.countRec + diff
		state.trimEnd = state.trimEnd + diff
		state.records = newHeight
		state.page = Math.floor(state.trimEnd / (state.records - 1))

		pages = Math.ceil(RECORDCOUNT / state.records)
		pageButtons(pages)
	}
	else if (diff < 0 && state.page != pages && state.countRec - 1 >= newHeight) {
		// Delete rows that are not on the last page
		deleteRows(state.countRec, diff)

		state.countRec = state.countRec + diff
		state.trimEnd = state.trimEnd + diff
		state.records = newHeight
		state.page = Math.floor(state.trimEnd / (state.records - 1))

		pages = Math.ceil(RECORDCOUNT / state.records)
		pageButtons(pages)
	}
	else if (diff > 0 && start <= RECORDCOUNT - 1) {
		// Add rows if end of data is not yet reached
		let recordsLink = "/records?from=" + start + "&to=" + end
		addRows(recordsLink)

		state.trimEnd = state.trimEnd + diff
		state.records = newHeight
		state.page = Math.floor(state.trimEnd / (state.records - 1))

		pages = Math.ceil(RECORDCOUNT / state.records)
		pageButtons(pages)
	}
	else {
		state.records = newHeight
		let pages = Math.ceil(RECORDCOUNT / state.records)
		pageButtons(pages)
	}

})



window.onload = () => {
	getData()
}












//  o   o
//               /^^^^^7
// '  '     ,oO))))))))Oo,
//        ,'))))))))))))))), /{
//   '  ,'o  ))))))))))))))))={
//      >    ))))))))))))))))={
//      `,   ))))))\ \)))))))={
//        ',))))))))\/)))))' \{
//          '*O))))))))O*'
