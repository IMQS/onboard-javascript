let totalPages: number;
let currentPage: number;

const state = {
	IMQS: "http://localhost:2050",
	currentValueOfFirstRecord: 1,
	currentFirstRecordIndex: 1,
	recordsPerPage: 16,
	searchedIndex: null as number | null,
	isButtonDisabled: false
};

// Fetch the total number of records from the server.
function totalRecords(): Promise<number> {
	return fetch(`${state.IMQS}/recordCount`)
		.then((recordCountResponse) => recordCountResponse.text())
		.then((recordCountText) => {
			const recordCount = JSON.parse(recordCountText);
			return recordCount;
		}).catch((error) => {
			throw error;
		});
}

// Fetch column names and creates them as table headings
function fetchColumns() {
	return fetch(`${state.IMQS}/columns`)
		.then((columnsResponse) => {
			return columnsResponse.json();
		})
		.then(async (columns) => {
			const tableHeaderRow = $("#tableHeaderRow");
			for (const columnName of columns) {
				const th = document.createElement("th");
				th.textContent = columnName;
				tableHeaderRow.append(th);
			}
			const recordCount = await totalRecords();
			totalPages = Math.ceil(recordCount / state.recordsPerPage);
			updateScreen();
		}).catch((error) => {
			throw error;
		});
}

// Fetch a range of records from the server based on specified indices.
function fetchRecords(fromRecord: number, toRecord: number): Promise<any> {
	if (fromRecord > toRecord) {
		fromRecord = toRecord
	}
	return fetch(`${state.IMQS}/records?from=${fromRecord}&to=${toRecord}`)
		.then((response) => response.text())
		.then((dataText) => JSON.parse(dataText))
		.catch((error) => {
			throw error;
		});
}

// Calculate the number of records that can fit on the screen.
function screenCalculations(screenHeight: number): number {
	const estimatedRowHeightFactor = 1;
	const estimatedRowHeight = estimatedRowHeightFactor * 50;
	const recordsPerPage = Math.floor(screenHeight / estimatedRowHeight) - 1;
	return Math.max(recordsPerPage - 2, 1);
}

// Handles the input for the search
function inputHandling(): Promise<void> {
	return totalRecords()
		.then((totalRecCount) => {
			const searchInput = document.getElementById("searchInput") as HTMLInputElement;
			searchInput.max = (totalRecCount - 1).toString();
		});
}

function debounce(func: any, delay: number) {
	let timeoutId: any;
	return function (...args: any) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}

// Display records on the page based on the specified range.
async function displayData(fromRecord: number, recordsDisplayed: number) {
	$("#loader").show();
	$("#tableWrapper").hide();
	let isSearchMode = state.searchedIndex !== null;
	const searchIndexOnPage = isSearchMode ? state.searchedIndex! - fromRecord : 0;
	fromRecord = Math.max(fromRecord, 1);
	const recordCount = await totalRecords();
	const maximumRecords = Math.min(recordCount - fromRecord, recordsDisplayed);
	const toRecord = fromRecord + maximumRecords - 1;
	const data = await fetchRecords(fromRecord, toRecord);
	let tableData = "";
	if (isSearchMode) {
		if (currentPage * state.recordsPerPage > recordCount) {
			recordsDisplayed = recordCount - fromRecord;
		}
		state.currentValueOfFirstRecord = parseInt(data[0][0]);
		state.currentFirstRecordIndex = fromRecord;
		if (recordsDisplayed >= 16) {
			currentPage = totalPages;
			state.currentFirstRecordIndex = (totalPages - 1) * state.recordsPerPage;
		}
	} else {
		fromRecord = Math.max(
			fromRecord + searchIndexOnPage - (recordsDisplayed - 1), 0);
	}
	for (const record of data) {
		tableData += "<tr>";
		for (const value of record) {
			tableData += `<td>${value}</td>`;
		}
		tableData += "</tr>";
	}
	$("#tableBody").html(tableData);
	$("#loader").hide();
	$("#tableWrapper").show();
}

// Search for records by a given value and display them on the page.
async function searchMethod(searchValue: any) {
	searchValue = Math.min(searchValue, (await totalRecords()) - 1);
	let targetPage = Math.ceil((searchValue + 1) / state.recordsPerPage);
	targetPage = Math.min(targetPage, totalPages);
	const lastRecordIndex = (await totalRecords()) - 1;
	const searchIndex = Math.min(searchValue, lastRecordIndex);
	const searchPage = Math.ceil((searchIndex + 1) / state.recordsPerPage);
	const fromRecord = Math.max(searchIndex - (state.recordsPerPage - 1), 0);
	const toRecord = Math.min(fromRecord + state.recordsPerPage - 1, lastRecordIndex);
	return fetchRecords(fromRecord, toRecord)
		.then((records) => {
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
				state.searchedIndex = foundIndex;
				currentPage = searchPage;
				state.currentFirstRecordIndex = (searchPage - 1) * state.recordsPerPage;
				return displayData(state.currentFirstRecordIndex, state.recordsPerPage);
			} else {
				state.searchedIndex = null;
			}
			return Promise.resolve();
		})
		.then(() => {
			$("#loader").hide();
			$("#tableWrapper").show();
			$("#prevPageButton").show();
			if (searchPage === totalPages) {
				$("#nextPageButton").hide();
			} else {
				$("#nextPageButton").show();
			}
		}).catch((error) => {
			throw error;
		});
}

// Update the screen layout and display records based on the current screen/window size
async function updateScreen() {
	const newScreenHeight = window.innerHeight;
	totalRecords();
	state.recordsPerPage = screenCalculations(newScreenHeight);
	$("#loader").show();
	$("#tableWrapper").hide();
	if (state.searchedIndex !== null) {
		const searchPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
		const searchPageIndex = state.searchedIndex % state.recordsPerPage;
		state.searchedIndex = (searchPage - 1) * state.recordsPerPage + searchPageIndex;
		displayData(Math.max(state.searchedIndex - state.recordsPerPage + 1, 0), state.recordsPerPage);
	} else {
		const previousFirstRecordIndex = state.currentFirstRecordIndex;
		currentPage = Math.ceil((state.currentFirstRecordIndex + 1) / state.recordsPerPage);
		displayData(state.currentFirstRecordIndex, state.recordsPerPage);
	}
	$("#loader").hide();
	$("#tableWrapper").show();
	if (currentPage === totalPages) {
		$("#nextPageButton").hide();
	} else {
		$("#nextPageButton").show();
	}
	if (state.currentFirstRecordIndex <= 1) {
		$("#prevPageButton").hide();
	} else {
		$("#prevPageButton").show();
	}
}

window.onload = async function () {
	$("#loader").hide();
	updateScreen();
	fetchColumns();
	inputHandling();
	$(window).on("resize", debounce(async () => {
		$("#tableWrapper").hide();
		$("#loader").show();
		updateScreen()
			.then(async () => {
				const totalRecCount = await totalRecords();
				if (currentPage * state.recordsPerPage > totalRecCount - 1) {
					const lastPage = Math.ceil(totalRecCount / state.recordsPerPage);
					currentPage = lastPage;
					state.currentFirstRecordIndex = (lastPage - 1) * state.recordsPerPage;
					return displayData(state.currentFirstRecordIndex, state.recordsPerPage);
				}
			})
			.then(() => {
				$("#loader").hide();
				$("#tableWrapper").show();
			}).catch((error) => {
				throw (error);
			});
	}, 50));

	$("#searchInput").on("keydown", function (e) {
		if (e.key === "e" || e.key === "E" || e.key === "."
			|| e.key === "+" || e.key === "-") {
			e.preventDefault();
		}
	})

	$("#searchForm").submit(async function (e) {
		e.preventDefault();
		const searchValue = $("#searchInput").val();
		$("#tableWrapper").hide();
		$("#loader").show();
		state.searchedIndex = null;
		await searchMethod(searchValue);
		if (state.searchedIndex !== null) {
			currentPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
			state.currentFirstRecordIndex = Math.max(state.searchedIndex - state.recordsPerPage + 1, 0);
		};
		$("#loader").hide();
		$("#tableWrapper").show();
	})

	$("#prevPageButton").on("click", async () => {
		if ($("#prevPageButton").hasClass("hidden")) {
			return;
		}
		$("#prevPageButton").addClass("hidden");
		state.searchedIndex = null;
		const firstRecordOfCurrentPage = (currentPage - 1) * state.recordsPerPage;
		if (firstRecordOfCurrentPage <= 16) {
			currentPage = 1;
			state.currentFirstRecordIndex = 1;
		} else {
			currentPage--;
			state.currentFirstRecordIndex -= state.recordsPerPage;
		}
		const fromRecord = state.currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		displayData(fromRecord, state.recordsPerPage)
			.then(() => {
				setTimeout(() => {
					$("#nextPageButton").show();
					$("#prevPageButton").show();
					$("#prevPageButton").removeClass("hidden");
					$("#loader").hide();
					$("#tableWrapper").show();
					if (state.currentFirstRecordIndex <= 1) {
						$("#prevPageButton").hide();
					} else if (currentPage < totalPages) {
						$("#nextPageButton").show();
					}
				}, 100);
			}).catch((error) => {
				throw error;
			});
	});

	$("#nextPageButton").on("click", async () => {
		if ($("#nextPageButton").hasClass("hidden")) {
			return;
		}
		$("#nextPageButton").addClass("hidden");
		state.searchedIndex = null;
		const totalRecCount = await totalRecords();
		const remainingRecords = totalRecCount - (currentPage * state.recordsPerPage);
		if (remainingRecords > 0 && currentPage < totalPages) {
			currentPage++;
			state.currentFirstRecordIndex += state.recordsPerPage;
		} else {
			currentPage = totalPages;
		}
		let fromRecord = state.currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		displayData(fromRecord, state.recordsPerPage)
			.then(() => {
				setTimeout(() => {
					$("#nextPageButton").show();
					$("#prevPageButton").show();
					$("#nextPageButton").removeClass("hidden");
					$("#loader").hide();
					$("#tableWrapper").show();
					if (state.currentFirstRecordIndex >= totalRecCount) {
						$("#nextPageButton").hide();
					}
				}, 100);
			}).catch((error) => {
				throw error;
			});
	});

}
