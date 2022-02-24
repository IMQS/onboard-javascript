
let state = {
	'page': 1,
	'records': 15,

	'window': 10
}

function searchFunction() {
	// Get entered ID and calculate what page it is on
	let id = Number($('#id-search').val())
	let pageNum = Math.ceil((id + 1) / state.records)
	console.log("Go to page ", pageNum)
	// Set page to the one that the searched ID is on
	state.page = pageNum
	loadIntoTable(document.querySelector("table"))
}


function dropFunction() {
	let num = Number($('#show-by').val())
	state.records = num
	console.log("Show records of ", state.records)
	loadIntoTable(document.querySelector("table"))
}


async function pagination(tableData: any, numRecords: number, page: number, records: number) {
	console.log("In pag: ", numRecords, " and ", page, " and ", records)
	let trimStart = (page - 1) * records
	let trimEnd = trimStart + records
	console.log("In pag: trimStart", trimStart, " and trimEnd", trimEnd, " records? ", records)

	let trimmedData = tableData.slice(trimStart, trimEnd)
	let pages = Math.ceil(numRecords / records)

	// User info: Display number of records and pages on window
	let pageDet = document.getElementById('page-details')
	pageDet!.innerHTML = `<p>There are <strong>${numRecords + 1}</strong> records and <strong>${pages}</strong> pages</p>`

	return {
		'data': trimmedData,
		'pages': pages
	}
}

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

	// Button numbers cannot exceed number of pages
	if (maxRight > pages) {
		maxLeft = pages - (state.window - 1)
		maxRight = pages

		if (maxLeft < 1) {
			maxLeft = 1
		}
	}

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


async function loadIntoTable(table: any) {
	// Select table elements to populate
	let tableHead = table.querySelector("thead")
	let tableBody = table.querySelector("tbody")

	let numRecords = await (await fetch('/recordCount')).json()
	let cnumRecords = numRecords - 1
	let recordsLink = "/records?from=0&to=" + cnumRecords
	let tableData = await (await fetch(recordsLink)).json()

	console.log('Records:', state.records)

	let rows = pagination(tableData, cnumRecords, state.page, state.records)
	console.log('Data:', rows)

	// API call for column headers
	let hearders = await (await fetch('/columns')).json()

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
}

window.onload = () => {
	loadIntoTable(document.querySelector("table"))
}
