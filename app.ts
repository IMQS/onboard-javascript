window.onload = async function () {
	$("#loader").hide();
	await fetchTotalRecordCount();
	updateRecordsPerPage();
	fetchAndDisplayColumns();
	handleSpecialResize();
};
// Global variables
const IMQS: string = "http://localhost:2050";
let totalRecordCount: number;
let totalPages: number;
let currentValueOfFirstRecord: number = 1;
let currentFirstRecordIndex: number = 1;
let currentPage: number = 1;
let recordsPerPage: number;
let resizeTimeout: number | undefined;
let searchResultDisplay = false;
let isSearchMode = false;
let searchResultIndexes: number[] = [];
let specialResizeOccurred = false;
let isNavigation = true;
let searchedIndex: number | null = null;
window.addEventListener("resize", async () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(async () => {
		await updateRecordsPerPage();
		if (searchedIndex !== null && !isSearchMode) {
			const searchPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
			const newFromRecord = (searchPage - 1) * recordsPerPage;
			const newToRecord = newFromRecord + recordsPerPage - 1;
			const actualFromRecord = Math.min(newFromRecord + 1, totalRecordCount);
			const actualToRecord = Math.min(newToRecord + 1, totalRecordCount);

			if (
				currentFirstRecordIndex >= newFromRecord &&
				currentFirstRecordIndex <= newToRecord
			) {
				// If the search result is still within the displayed range after resizing,
				// update the current page and first record index accordingly
				currentFirstRecordIndex = newFromRecord;
				currentPage = searchPage;
				await displayPageData(currentFirstRecordIndex, recordsPerPage);
				$("#currentPageNumber").text(`Page ${currentPage}`);
				highlightSearchResult();
			}
		}
	}, 300);
});
// Functionality
async function fetchTotalRecordCount(): Promise<void> {
	try {
		let recordCount: number = await (await fetch(`${IMQS}/recordCount`)).json();
		totalRecordCount = recordCount;
		$("#totalRecordCount").text(totalRecordCount);
	} catch (error) {
		console.error("Error fetching total record count:", error);
	}
}
async function fetchAndDisplayColumns(): Promise<void> {
	try {
		// Fetch columns
		let columns: string[] = await (await fetch(`${IMQS}/columns`)).json();
		let tableHeaderRow = $("#tableHeaderRow");
		columns.forEach((columnName: string) => {
			let th = document.createElement("th");
			th.textContent = columnName;
			tableHeaderRow.append(th);
		});
		// Fetch total record count
		await fetchTotalRecordCount();
		// Calculate total pages based on the record count and records per page
		const lastRecordIndex = totalRecordCount - 1;
		totalPages = Math.ceil((lastRecordIndex + 1) / recordsPerPage);
		// Display initial page
		await displayPageData((currentPage - 1) * recordsPerPage, recordsPerPage);
	} catch (error) {
		console.log("ERROR:", error);
	}
}
async function displayPageData(fromRecord: number, recordsToDisplay: number) {
	const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
	try {
		// Ensure fromRecord is never negative
		fromRecord = Math.max(fromRecord, 0);
		const maxRecordsToDisplay = Math.min(
			totalRecordCount - fromRecord,
			recordsToDisplay
		);
		let response = await fetch(
			`${IMQS}/records?from=${fromRecord}&to=${fromRecord + maxRecordsToDisplay - 1
			}`
		);
		let data = await response.json();
		let tableData = "";
		// Calculate the position of the search result on the current page
		const searchIndexOnPage = searchResultIndexes[0] - fromRecord;
		if (searchResultDisplay) {
			// If a search result is being displayed, adjust fromRecord accordingly
			const searchIndex = searchResultIndexes[0];
			const searchPage = Math.ceil((searchIndex + 1) / recordsPerPage);
			const newFromRecord = (searchPage - 1) * recordsPerPage;
			const newToRecord = newFromRecord + recordsPerPage - 1;
			const actualFromRecord = Math.min(newFromRecord + 1, totalRecordCount);
			const actualToRecord = Math.min(newToRecord + 1, totalRecordCount);
			// Display the new data
			fromRecord = newFromRecord;
			recordsToDisplay = recordsPerPage;
			searchResultIndexes.forEach((searchIndex: any) => {
				const rowIndex = searchIndex % recordsPerPage;
				const rowElement = $("#tableBody tr").eq(rowIndex);
				rowElement.css("background-color", "var(--results-color)");
			});
			searchResultDisplay = false;
		}
		// Adjust fromRecord based on the search result position and screen size
		else if (!isSearchMode) {
			const firstRecordValue = parseInt(data[0][0]);
			const firstRecordIndex = fromRecord;
			if (currentPage * recordsPerPage > totalRecordCount) {
				recordsToDisplay = totalRecordCount - fromRecord;
			}
			// Update current value and index of the first record
			currentValueOfFirstRecord = parseInt(data[0][0]);
			currentFirstRecordIndex = fromRecord;
		} else {
			// Adjust fromRecord for regular search mode navigation
			fromRecord = Math.max(
				fromRecord + searchIndexOnPage - (recordsToDisplay - 1),
				0
			);
			isSearchMode = false;
		}
		data.forEach((record: any[]) => {
			tableData += "<tr>";
			record.forEach((value: string) => {
				tableData += `<td>${value}</td>`;
			});
			tableData += "</tr>";
		});
		$("#tableBody").html(tableData);
	} catch (error) {
		console.log("ERROR:", error);
	}
}
async function updateRecordsPerPage(isNavigation = false) {
    const screenHeight = window.innerHeight;
    const estimatedRowHeightFactor = totalRecordCount / 1000000;
    const estimatedRowHeight = estimatedRowHeightFactor * 50;

    // Calculate the maximum records that can fit on the screen minus one
    recordsPerPage = Math.floor(screenHeight / estimatedRowHeight) - 1;
    recordsPerPage = Math.max(recordsPerPage - 2, 1); // Ensure a minimum of 1 record per page

    $("#loader").show();
    $("#tableWrapper").hide();

    // If a searched value is present, adjust the currentFirstRecordIndex
    if (searchedIndex !== null) {
        currentFirstRecordIndex = Math.max(searchedIndex - recordsPerPage + 1, 0);
    }

    // Store the currentFirstRecordIndex before updating it
    const previousFirstRecordIndex = currentFirstRecordIndex;

    // Update the displayed data for the adjusted page
    await displayPageData(currentFirstRecordIndex, recordsPerPage);

    // Update the current page based on the updated first record index
    currentPage = Math.ceil((currentFirstRecordIndex + 1) / recordsPerPage);
    $("#currentPageNumber").text(`Page ${currentPage}`);

    $("#loader").hide();
    $("#tableWrapper").show();

    // If navigation buttons were clicked, restore the previous currentFirstRecordIndex
    if (isNavigation) {
        currentFirstRecordIndex = previousFirstRecordIndex;
    }
}


async function handleSpecialResize() {
	const lastPageFirstRecordValue = totalRecordCount - recordsPerPage + 1;
	if (
		currentValueOfFirstRecord >= lastPageFirstRecordValue &&
		currentValueOfFirstRecord <= totalRecordCount
	) {
		// Calculate the special recordsPerPage value for last page
		const specialRecordsPerPage = recordsPerPage - 1;
		// Calculate the special first record index
		const specialFirstRecordIndex = Math.max(
			lastPageFirstRecordValue - specialRecordsPerPage,
			0
		);
		// Update the current page and first record index
		currentPage = totalPages;
		currentFirstRecordIndex = specialFirstRecordIndex;
		// Calculate the adjusted fromRecord value
		let fromRecord = Math.max(
			lastPageFirstRecordValue - specialRecordsPerPage,
			0
		);
		// Display page data for the special last page
		await displayPageData(fromRecord, specialRecordsPerPage);
	}

}
async function searchRecordByValue(searchValue: any) {
	try {
		searchValue = parseInt(searchValue);
		await fetchTotalRecordCount();
		let targetPage = Math.ceil((searchValue + 1) / recordsPerPage);
		targetPage = Math.min(targetPage, totalPages);
		const fromRecord = Math.max((targetPage - 1) * recordsPerPage, 0);
		const toRecord = Math.min(
			fromRecord + recordsPerPage - 1,
			totalRecordCount - 1
		);
		const response = await fetch(
			`${IMQS}/records?from=${fromRecord}&to=${toRecord}`
		);
		const records = await response.json();
		let foundIndex = -1;
		for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
			const record = records[recordIndex];
			const idValue = parseInt(record[0]);
			if (idValue === searchValue) {
				foundIndex = fromRecord + recordIndex;
				break;
			}
		}
		if (foundIndex !== -1) {
			searchedIndex = foundIndex;

			// Calculate the page and index position of the search result on the current page
			const searchPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
			const searchPageIndex = searchedIndex % recordsPerPage;

			// Display the data for the updated page and index
			await displayPageData((searchPage - 1) * recordsPerPage, recordsPerPage);

			// Highlight the search result on the current page
			highlightSearchResult();

			// Display search results message
			$("#searchResultsMessage").html(
				`<div>Showing search Results for Record number ${searchValue}</div>`
			);
		} else {
			searchedIndex = null;
			$("#tableBody").html("");
			$("#recordRange").html("No records found.");
			$("#searchResultsMessage").html(
				`<div>No results found for ID "<span>${searchValue}</span>"</div>`
			);
		}
	} catch (error) {
		console.error("Error searching for record:", error);
	} finally {
		$("#loader").hide();
		$("#tableWrapper").show();
	}
}
function highlightSearchResult() {
	if (searchedIndex !== null) {
		const currentPageIndex = currentPage - 1;
		const startIndex = currentPageIndex * recordsPerPage;
		const rowIndexOnPage = searchedIndex - startIndex;
		let rowElement = $("#tableBody tr").eq(rowIndexOnPage);
		rowElement.css("background-color", "var(--results-color)");
	}
}
$("#searchForm").submit(async function (e) {
	e.preventDefault();
	const searchValue = $("#searchInput").val();
	$("#tableBody tr").css("background-color", "");
	$("#searchResultsMessage").show();
	$("#tableWrapper").hide();
	$("#loader").show();
	await searchRecordByValue(searchValue);
	const currentPageIndex = currentPage - 1;
	const startIndex = currentPageIndex * recordsPerPage;
	for (const originalIndex of searchResultIndexes) {
		const rowIndexOnPage = originalIndex - startIndex;
		let rowElement = $("#tableBody tr").eq(rowIndexOnPage);
		rowElement.css("background-color", "var(--results-color)");
	}
});
$("#prevPageButton").on("click", async () => {
	searchedIndex = null;
	const lastRecordOnFirstPage = recordsPerPage;
	const shouldGoToDefaultFirstPage =
		currentValueOfFirstRecord > 1 &&
		currentValueOfFirstRecord <= lastRecordOnFirstPage;
	if (shouldGoToDefaultFirstPage) {
		// Go to the default first page for large screen size
		currentPage = 1;
		currentFirstRecordIndex = 0;
	} else if (currentPage > 1) {
		// Proceed with regular navigation to the previous page
		currentPage--;
		currentFirstRecordIndex -= recordsPerPage;
	}
	let fromRecord = currentFirstRecordIndex;
	await displayPageData(fromRecord, recordsPerPage);
	$("#currentPageNumber").text(`Page ${currentPage}`);
});
$("#nextPageButton").on("click", async () => {
	searchedIndex = null;
	if (currentPage * recordsPerPage < totalRecordCount) {
		currentPage++;
		currentFirstRecordIndex += recordsPerPage;
	}
	// Calculate the threshold value based on the last page's first record value
	const lastPageFirstRecordValue = totalRecordCount - recordsPerPage + 1;
	const displayedRecordsIncludeHighValues =
		currentFirstRecordIndex >= lastPageFirstRecordValue;
	// Go to default last page for the current screen size if the condition is met
	if (displayedRecordsIncludeHighValues) {
		const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
		currentPage = nextPage;
		currentFirstRecordIndex = (currentPage - 1) * recordsPerPage;
	}
	let fromRecord = currentFirstRecordIndex;
	await displayPageData(fromRecord, recordsPerPage);
	$("#currentPageNumber").text(`Page ${currentPage}`);
});
