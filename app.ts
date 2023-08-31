// Global variables
const IMQS = "http://localhost:2050";
let totalRecordCount: number;
let totalPages: number;
let currentValueOfFirstRecord = 1;
let currentFirstRecordIndex = 1;
let currentPage: number;
let recordsPerPage: number;
let searchedIndex: number | null = null;
let resizeTimeout: number;


async function totalRecords(): Promise<void> {
	try {
		let recordCountResponse = await fetch(`${IMQS}/recordCount`);
		let recordCountText = await recordCountResponse.text();
		let recordCount = parseInt(recordCountText);
		totalRecordCount = recordCount;
	} catch (error) {
		throw (error)
	};
};
async function displayColumns() {
	try {
		let columnsResponse = await fetch(`${IMQS}/columns`);
		let columns = await columnsResponse.json();
		let tableHeaderRow = $("#tableHeaderRow");
		columns.forEach((columnName: string) => {
			let th = document.createElement("th");
			th.textContent = columnName;
			tableHeaderRow.append(th);
		});
		await totalRecords();
		totalPages = Math.ceil(totalRecordCount / recordsPerPage);
		await updatePages();
	} catch (error) {
		throw (error)
	};
};
async function displayData(fromRecord: number, recordsDisplayed: number) {
	let isSearchMode = false;
	let searchResultIndexes: number[] = [];
	try {
		fromRecord = Math.max(fromRecord, 0);
		const maximumRecords = Math.min(
			totalRecordCount - fromRecord,
			recordsDisplayed
		);
		let response = await fetch(
			`${IMQS}/records?from=${fromRecord}&to=${fromRecord + maximumRecords - 1
			}`
		);
		let dataText = await response.text();
		let data = JSON.parse(dataText);
		let tableData = "";
		if (currentFirstRecordIndex <= 1) {
			$("#prevPageButton").hide();
		} else {
			$("#prevPageButton").show();
		};
		const lastRecordOnPage = currentFirstRecordIndex + recordsPerPage - 1;
		if ((lastRecordOnPage === totalRecordCount - 1 || searchedIndex !== null) && lastRecordOnPage === totalRecordCount - 1) {
			$("#nextPageButton").hide();
		} else {
			$("#nextPageButton").show();
		};
		let isSearchMode = false;
		let searchResultIndexes: number[] = [];
		let searchResultDisplay = false;
		const searchIndexOnPage = searchResultIndexes[0] - fromRecord;
		if (searchResultDisplay) {
			const searchIndex = searchResultIndexes[0];
			const searchPage = Math.ceil((searchIndex + 1) / recordsPerPage);
			const newFromRecord = (searchPage - 1) * recordsPerPage;
			const newToRecord = newFromRecord + recordsPerPage - 1;
			const actualFromRecord = Math.min(newFromRecord + 1, totalRecordCount);
			const actualToRecord = Math.min(newToRecord + 1, totalRecordCount);
			fromRecord = newFromRecord;
			recordsDisplayed = recordsPerPage;
			searchResultIndexes.forEach((searchIndex: any) => {
				const rowIndex = searchIndex % recordsPerPage;
				const rowElement = $("#tableBody tr").eq(rowIndex);
				rowElement.css("background-color", "var(--results-color)");
			});
			searchResultDisplay = false;
		}
		else if (!isSearchMode) {
			if (currentPage * recordsPerPage > totalRecordCount) {
				recordsDisplayed = totalRecordCount - fromRecord;
			}
			currentValueOfFirstRecord = parseInt(data[0][0]);
			currentFirstRecordIndex = fromRecord;
		} else {
			fromRecord = Math.max(
				fromRecord + searchIndexOnPage - (recordsDisplayed - 1), 0
			);
			isSearchMode = false;
		};
		data.forEach((record: any[]) => {
			tableData += "<tr>";
			record.forEach((value: string) => {
				tableData += `<td>${value}</td>`;
			});
			tableData += "</tr>";
		});
		$("#tableBody").html(tableData);
	} catch (error) {
		throw (error)
	};
};
async function updatePages(isNavigation = false) {
	const screenHeight = window.innerHeight;
	const estimatedRowHeightFactor = totalRecordCount / 1000000;
	const estimatedRowHeight = estimatedRowHeightFactor * 50;
	recordsPerPage = Math.floor(screenHeight / estimatedRowHeight) - 1;
	recordsPerPage = Math.max(recordsPerPage - 2, 1);
	$("#loader").show();
	$("#tableWrapper").hide();
	if (searchedIndex !== null) {
		const searchPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
		const searchPageIndex = searchedIndex % recordsPerPage;
		searchedIndex = (searchPage - 1) * recordsPerPage + searchPageIndex;
		await displayData(
			Math.max(searchedIndex - recordsPerPage + 1, 0), recordsPerPage);
	};
	const previousFirstRecordIndex = currentFirstRecordIndex;
	currentPage = Math.ceil((currentFirstRecordIndex + 1) / recordsPerPage);
	await displayData(currentFirstRecordIndex, recordsPerPage);
	$("#loader").hide();
	$("#tableWrapper").show();
	if (isNavigation) {
		currentFirstRecordIndex = previousFirstRecordIndex;
	};
};
async function searchMethod(searchValue: any) {
	try {
		searchValue = Math.min(searchValue, totalRecordCount - 1);
		let targetPage = Math.ceil((searchValue + 1) / recordsPerPage);
		targetPage = Math.min(targetPage, totalPages);
		const lastRecordIndex = totalRecordCount - 1;
		const searchIndex = Math.min(searchValue, lastRecordIndex);
		const searchPage = Math.ceil((searchIndex + 1) / recordsPerPage);
		const fromRecord = (searchPage - 1) * recordsPerPage;
		const toRecord = Math.min(fromRecord + recordsPerPage - 1, lastRecordIndex);
		const response = await fetch(
			`${IMQS}/records?from=${fromRecord}&to=${toRecord}`
		);
		const recordsText = await response.text();
		const records = JSON.parse(recordsText);
		let foundIndex = -1;
		let recordIndex = 0;
		for (const record of records) {
			const idValue = parseInt(record[0]);
			if (idValue === searchValue) {
				foundIndex = fromRecord + recordIndex;
				break;
			}
			recordIndex++;
		}
		if (foundIndex !== -1) {
			searchedIndex = foundIndex;
			const searchPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
			const searchPageIndex = searchedIndex % recordsPerPage;
			currentPage = searchPage;
			currentFirstRecordIndex = (searchPage - 1) * recordsPerPage;
			await displayData(currentFirstRecordIndex, recordsPerPage);
		} else {
			searchedIndex = null;
		};
	} catch (error) {
		throw (error);
	} finally {
		$("#loader").hide();
		$("#tableWrapper").show();
	};
};
async function adjustedResize() {
	const screenHeight = window.innerHeight;
	const estimatedRowHeightFactor = totalRecordCount / 1000000;
	const estimatedRowHeight = estimatedRowHeightFactor * 50;
	recordsPerPage = Math.floor(screenHeight / estimatedRowHeight) - 1;
	recordsPerPage = Math.max(recordsPerPage - 2, 1);
	const lastRecordsIndex = totalRecordCount - 16;
	if (currentValueOfFirstRecord >= lastRecordsIndex && currentValueOfFirstRecord <= totalRecordCount) {
		const lastPageFirstRecordIndex = Math.max(lastRecordsIndex - recordsPerPage + 1, 0);
		const lastPage = Math.ceil(totalRecordCount / recordsPerPage);
		currentPage = lastPage;
		currentFirstRecordIndex = lastPageFirstRecordIndex;
	} else if (currentPage * recordsPerPage > totalRecordCount - 5) {
		const lastPage = Math.ceil(totalRecordCount / recordsPerPage);
		currentPage = lastPage;
		currentFirstRecordIndex = (lastPage - 1) * recordsPerPage;
	}
	if (searchedIndex !== null) {
		const searchPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
		const searchPageIndex = searchedIndex % recordsPerPage;
		searchedIndex = (searchPage - 1) * recordsPerPage + searchPageIndex;
		await searchMethod(currentValueOfFirstRecord);
	}
	let fromRecord = currentFirstRecordIndex;
	await displayData(fromRecord, recordsPerPage);
};
function debounce(func: any, delay: any) {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(func, delay)
};
window.onload = async function () {
	$("#loader").hide();
	await displayColumns();
	adjustedResize();
	$("#searchForm").submit(async function (e) {
		e.preventDefault();
		const searchValue = $("#searchInput").val();
		$("#tableBody tr").css("background-color", "");
		$("#tableWrapper").hide();
		$("#loader").show();
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		};
		searchedIndex = null;
		await searchMethod(searchValue);
		if (searchedIndex !== null) {
			currentPage = Math.ceil((searchedIndex + 1) / recordsPerPage);
			currentFirstRecordIndex = Math.max(searchedIndex - recordsPerPage + 1, 0);
		};
		await updatePages(true);
		$("#loader").hide();
		$("#tableWrapper").show();
	});
	$("#searchInput").on("keydown", function (e) {
		if (e.key === "e" || e.key === "E" || e.key === "."
			|| e.key === "+" || e.key === "-") {
			e.preventDefault();
		}
	});
	$("#prevPageButton").on("click", async () => {
		searchedIndex = null;
		const lastRecordOnFirstPage = recordsPerPage;
		const shouldGoToDefaultFirstPage =
			currentValueOfFirstRecord > 1 &&
			currentValueOfFirstRecord <= lastRecordOnFirstPage;
		if (shouldGoToDefaultFirstPage) {
			currentPage = 1;
			currentFirstRecordIndex = 0;
		} else if (currentPage > 1) {
			currentPage--;
			currentFirstRecordIndex -= recordsPerPage;
		}
		let fromRecord = currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		await displayData(fromRecord, recordsPerPage);
		setTimeout(() => {
			$("#loader").hide();
			$("#tableWrapper").show();
			if (currentPage === totalPages) {
				$("#nextPageButton").hide();
			} else if (currentPage > 1) {
				$("#prevPageButton").show();
			}
			if (currentPage > 1) {
				$("#prevPageButton").show();
			};
		}, 1000);
	});
	$("#nextPageButton").on("click", async () => {
		searchedIndex = null;
		if (currentPage * recordsPerPage < totalRecordCount) {
			currentPage++;
			currentFirstRecordIndex += recordsPerPage;
		}
		const lastPageFirstRecordValue = totalRecordCount - recordsPerPage + 1;
		const displayedRecordsIncludeHighValues =
			currentFirstRecordIndex >= lastPageFirstRecordValue;
		if (displayedRecordsIncludeHighValues) {
			const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
			currentPage = nextPage;
			currentFirstRecordIndex = (currentPage - 1) * recordsPerPage;
		}
		let fromRecord = currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		await displayData(fromRecord, recordsPerPage);
		setTimeout(() => {
			$("#loader").hide();
			$("#tableWrapper").show();
			$("#prevPageButton").show();
			if (currentFirstRecordIndex === (totalRecordCount - 16)) {
				$("#nextPageButton").hide();
			} else if (currentPage < totalPages) {
				$("#nextPageButton").show();
			};
		}, 1000);
	});
};
window.addEventListener("resize", async () => {
	debounce(async () => {
		await updatePages();
		if (currentPage * recordsPerPage > totalRecordCount - 1) {
			const lastPage = Math.ceil(totalRecordCount / recordsPerPage);
			currentPage = lastPage;
			currentFirstRecordIndex = (lastPage - 1) * recordsPerPage;
			await displayData(currentFirstRecordIndex, recordsPerPage);
		};
	}, 500);
});
