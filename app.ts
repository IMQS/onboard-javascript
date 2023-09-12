const state = {
	IMQS: "http://localhost:2050",
	currentValueOfFirstRecord: 1,
	currentFirstRecordIndex: 0,
	currentPage: 1,
	totalPages: 1,
	recordsPerPage: 16,
	searchedIndex: null as number | null,
	isButtonDisabled: false
}

// Fetch the total number of records from the server.
function totalRecords(): Promise<number> {
	return fetch(`${state.IMQS}/recordCount`)
		.then((recordCountResponse) => {
			if (!recordCountResponse.ok) {
				throw new Error('Network response was not ok');
			}
			return recordCountResponse.json();
		})
		.catch((error) => {
			throw error;
		});
}

// Fetch column names and create them as table headings
function fetchColumns(): Promise<string[]> {
	return fetch(`${state.IMQS}/columns`)
		.then((columnsResponse) => {
			if (!columnsResponse.ok) {
				throw new Error('Network response was not ok');
			}
			return columnsResponse.json();
		})
		.then((columns: string[]) => {
			const tableHeaderRow = $("#tableHeaderRow");
			for (const columnName of columns) {
				const th = document.createElement("th");
				th.textContent = columnName;
				tableHeaderRow.append(th);
			}
			return columns;
		})
		.catch((error) => {
			throw error;
		});
}

// Fetch a range of records from the server based on specified indices.
function fetchRecords(fromRecord: number, toRecord: number): Promise<any> {
	if (fromRecord > toRecord) {
		throw new Error('Invalid arguments: fromRecord cannot be greater than toRecord');
	}
	return fetch(`${state.IMQS}/records?from=${fromRecord}&to=${toRecord}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.catch((error) => {
			throw error;
		});
}

// Calculate the number of records that can fit on the screen.
function windowAdjustments(screenHeight: number): number {
	const estimatedRowHeightFactor = 1;
	const estimatedRowHeight = estimatedRowHeightFactor * 50;
	const availableScreenHeight = screenHeight - 150;
	const recordsPerPage = Math.floor(availableScreenHeight / estimatedRowHeight);
	// Ensure a minimum of 1 record per page.
	return Math.max(recordsPerPage, 1);
}

// Handles the input for the search
function inputHandling(): Promise<void> {
	return totalRecords()
		.then(totalRecCount => {
			const searchInput = document.getElementById("searchInput") as HTMLInputElement;
			searchInput.min = "0";
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
async function displayData(fromRecord: number, recordsDisplayed: number): Promise<any> {
	$("#loader").show();
	$("#tableWrapper").hide();
	const adjustedFromRecord = Math.max(fromRecord, 0);
	const recordCount = await totalRecords();
	state.totalPages = Math.ceil(recordCount / state.recordsPerPage);
	if (state.currentPage * state.recordsPerPage > recordCount) {
		throw new Error('Requested records exceed the total record count');
	}
	const maximumRecords = Math.min(recordCount - adjustedFromRecord, recordsDisplayed);
	const toRecord = adjustedFromRecord + maximumRecords - 1;
	const data = await fetchRecords(adjustedFromRecord, toRecord);
	let tableData = "";
	if (data && data.length > 0) {
		state.currentValueOfFirstRecord = parseInt(data[0][0]);
		state.currentFirstRecordIndex = adjustedFromRecord;
		for (const record of data) {
			tableData += "<tr>";
			for (const value of record) {
				tableData += `<td>${value}</td>`;
			}
			tableData += "</tr>";
		}
	} else {
		throw new Error('No valid records found');
	}
	$("#tableBody").html(tableData);
	$("#loader").hide();
	$("#tableWrapper").show();
}

// Search for records by a given value and display them on the page.
async function searchMethod(searchValue: number): Promise<void> {
	const totalRecCount = await totalRecords();
	searchValue = Math.min(searchValue, totalRecCount - 1);
	const lastRecordIndex = totalRecCount - 1;
	const searchIndex = Math.min(searchValue, lastRecordIndex);
	const targetPage = Math.ceil((searchIndex + 1) / state.recordsPerPage);
	const fromRecord = Math.max(searchIndex - (state.recordsPerPage - 1), 0);
	const toRecord = Math.min(fromRecord + state.recordsPerPage - 1, lastRecordIndex);
	return fetchRecords(fromRecord, toRecord)
		.then((records) => {
			let foundIndex = -1;
			for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
				const idValue = parseInt(records[recordIndex][0]);
				if (idValue === searchValue) {
					foundIndex = fromRecord + recordIndex;
					break;
				}
			}
			if (foundIndex !== -1) {
				state.searchedIndex = foundIndex;
				state.currentPage = targetPage;
				state.currentFirstRecordIndex = (targetPage - 1) * state.recordsPerPage;
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
			if (targetPage === state.totalPages) {
				$("#nextPageButton").hide();
			} else {
				$("#nextPageButton").show();
			}
		})
		.catch((error) => {
			throw error;
		});
}

// Update the screen layout and display records based on the current screen/window size
async function updateScreen(): Promise<void> {
	const newScreenHeight = window.innerHeight;
	state.recordsPerPage = windowAdjustments(newScreenHeight);
	$("#loader").show();
	$("#tableWrapper").hide();
	if (state.searchedIndex !== null) {
		const searchPageIndex = state.searchedIndex % state.recordsPerPage;
		const firstRecordOfCurrentPage = (state.currentPage - 1) * state.recordsPerPage;
		if (searchPageIndex >= firstRecordOfCurrentPage && searchPageIndex < firstRecordOfCurrentPage + state.recordsPerPage) {
			displayData(firstRecordOfCurrentPage, state.recordsPerPage);
		} else {
			state.currentPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
			state.currentFirstRecordIndex = Math.max(state.searchedIndex - state.recordsPerPage + 1, 0);
			displayData(state.currentFirstRecordIndex, state.recordsPerPage);
		}
	} else {
		const previousFirstRecordIndex = state.currentFirstRecordIndex;
		state.currentPage = Math.ceil((state.currentFirstRecordIndex + 1) / state.recordsPerPage);
		displayData(state.currentFirstRecordIndex, state.recordsPerPage);
	}
	const totalRecCount = await totalRecords();
	if (state.currentPage * state.recordsPerPage > totalRecCount - 1) {
		// Go to the last page if necessary
		const lastPage = Math.ceil(totalRecCount / state.recordsPerPage);
		state.currentPage = lastPage;
		state.currentFirstRecordIndex = (lastPage - 1) * state.recordsPerPage;
		displayData(state.currentFirstRecordIndex, state.recordsPerPage);
	}
	$("#loader").hide();
	$("#tableWrapper").show();
	if (state.currentPage === state.totalPages) {
		$("#nextPageButton").hide();
	} else {
		$("#nextPageButton").show();
	}
	if (state.currentFirstRecordIndex <= 0) {
		$("#prevPageButton").hide();
	} else {
		$("#prevPageButton").show();
	}
}

window.onload = () => {
	$("#loader").hide();
	updateScreen();
	fetchColumns();
	inputHandling();
	$(window).on("resize", debounce(() => {
		updateScreen()
			.then(() => {
				$("#loader").hide();
				$("#tableWrapper").show();
			})
			.catch(error => {
				throw error('Error trying to resize the page:');
			});
	}, 250));

	$("#searchInput").on("keydown", (e) => {
		if (e.key === "e" || e.key === "E" || e.key === "."
			|| e.key === "+" || e.key === "-") {
			e.preventDefault();
		}
	});

	$("#searchForm").submit((e) => {
		e.preventDefault();
		const searchInput = document.getElementById("searchInput") as HTMLInputElement;
		const searchValue = Number(searchInput.value);
		$("#tableWrapper").hide();
		$("#loader").show();
		state.searchedIndex = null;
		searchMethod(searchValue)
			.then(() => {
				if (state.searchedIndex !== null) {
					state.currentPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
					state.currentFirstRecordIndex = Math.max(state.searchedIndex - state.recordsPerPage + 1, 0);
				};
			})
			.catch(error => {
				throw error('Error with searching function');
			});
		$("#loader").hide();
		$("#tableWrapper").show();
	});

	$("#prevPageButton").on("click", async () => {
		if ($("#prevPageButton").hasClass("hidden")) {
			return;
		}
		if (state.currentPage <= 1) {
			throw new Error("Already on the first page");
		}
		$("#prevPageButton").addClass("hidden");
		state.searchedIndex = null;
		const firstRecordOfCurrentPage = (state.currentPage - 1) * state.recordsPerPage;
		if (firstRecordOfCurrentPage <= state.recordsPerPage) {
			state.currentPage = 1;
			state.currentFirstRecordIndex = 0;
		} else {
			state.currentPage--;
			state.currentFirstRecordIndex -= state.recordsPerPage;
		}
		const fromRecord = state.currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		displayData(fromRecord, state.recordsPerPage)
			.then(() => {
				$("#nextPageButton").show();
				$("#prevPageButton").show();
				$("#prevPageButton").removeClass("hidden");
				$("#loader").hide();
				$("#tableWrapper").show();
				if (state.currentFirstRecordIndex <= 0) {
					$("#prevPageButton").hide();
				} else if (state.currentPage < state.totalPages) {
					$("#nextPageButton").show();
				}
			})
			.catch(error => {
				throw error;
			});
	});

	$("#nextPageButton").on("click", async () => {
		if ($("#nextPageButton").hasClass("hidden")) {
			return;
		}
		if (state.currentPage >= state.totalPages) {
			throw new Error("Already on the last page");
		}
		$("#nextPageButton").addClass("hidden");
		state.searchedIndex = null;
		const totalRecCount = await totalRecords();
		if (state.currentPage < state.totalPages) {
			state.currentPage++;
			state.currentFirstRecordIndex += state.recordsPerPage;
		} else {
			state.currentPage = state.totalPages;
		}
		let fromRecord = state.currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		displayData(fromRecord, state.recordsPerPage)
			.then(() => {
				$("#nextPageButton").show();
				$("#prevPageButton").show();
				$("#nextPageButton").removeClass("hidden");
				$("#loader").hide();
				$("#tableWrapper").show();
				if (state.currentFirstRecordIndex >= totalRecCount) {
					$("#nextPageButton").hide();
				}
			})
			.catch(error => {
				throw error;
			});
	});
}
