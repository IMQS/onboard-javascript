

const state = {
	'page': 1,
	'rows': 15,

	'window': 10
}

async function pagination(tableData: any, numRecords: number, page: number, rows: number) {
	let trimStart = (page - 1) * rows
	let trimEnd = trimStart + rows

	let trimmedData = tableData.slice(trimStart, trimEnd)
	let pages = Math.ceil(numRecords / rows)

	return {
		'data': trimmedData,
		'pages': pages
	}
}

function pageButtons(pages: number) {
	let pageNum = document.getElementById('page-number')
	pageNum!.innerHTML = `<p>Page ${state.page}</p>`
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
	// Select elements to populate
	let tableHead = table.querySelector("thead")
	let tableBody = table.querySelector("tbody")

	let numRecords = await (await fetch('/recordCount')).json()
	let cnumRecords = numRecords - 1
	let recordsLink = "/records?from=0&to=" + cnumRecords
	let tableData = await (await fetch(recordsLink)).json()

	let rows = pagination(tableData, cnumRecords, state.page, state.rows)
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
