let totalPages: number;
let currentPage: number;

const state = {
	IMQS: "http://localhost:2050",
	currentValueOfFirstRecord: 1,
	currentFirstRecordIndex: 1,
	recordsPerPage: 16,
	searchedIndex: null as number | null,
};

function totalRecords(): Promise<number> {
	return fetch(`${state.IMQS}/recordCount`)
		.then((recordCountResponse) => recordCountResponse.text())
		.then((recordCountText) => {
			const recordCount = JSON.parse(recordCountText);
			return recordCount;
		})
		.catch((error) => {
			throw error;
		});
}

function displayColumns() {
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
			};

			const recordCount = await totalRecords();
			totalPages = Math.ceil(recordCount / state.recordsPerPage);
			updatePages();
		})
		.catch((error) => {
			throw error;
		});
}

function fetchRecords(fromRecord: number, toRecord: number): Promise<any> {
	return fetch(`${state.IMQS}/records?from=${fromRecord}&to=${toRecord}`)
		.then((response) => response.text())
		.then((dataText) => JSON.parse(dataText))
		.catch((error) => {
			throw error;
		});
}

function debounce(func: any, delay: any) {
	let timeoutId: any;
	return function (...args: any) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}

async function displayData(fromRecord: number, recordsDisplayed: number) {
	try {
		$("#loader").show();
		$("#tableWrapper").hide();
		let isSearchMode = null;
		let searchResultIndexes: number[] = [];
		const searchIndexOnPage = searchResultIndexes[0] - fromRecord;		
		fromRecord = Math.max(fromRecord, 0);
		const recordCount = await totalRecords();
		const maximumRecords = Math.min(recordCount - fromRecord, recordsDisplayed);
		const data = await fetchRecords(fromRecord, fromRecord + maximumRecords - 1);
		let tableData = "";
		togglePaginationButtons();
		if (isSearchMode === true) {
			if (currentPage * state.recordsPerPage > recordCount) {
				recordsDisplayed = recordCount - fromRecord;
			}
			state.currentValueOfFirstRecord = parseInt(data[0][0]);
			state.currentFirstRecordIndex = fromRecord;
		} else {
			fromRecord = Math.max(
				fromRecord + searchIndexOnPage - (recordsDisplayed - 1), 0
			);
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
	} catch (error) {
		throw error;
	}
}

async function searchMethod(searchValue: any) {
    try {
        searchValue = Math.min(searchValue, (await totalRecords()) - 1);
        let targetPage = Math.ceil((searchValue + 1) / state.recordsPerPage);
        targetPage = Math.min(targetPage, totalPages);
        const lastRecordIndex = (await totalRecords()) - 1;
        const searchIndex = Math.min(searchValue, lastRecordIndex);
        const searchPage = Math.ceil((searchIndex + 1) / state.recordsPerPage);
        const fromRecord = Math.max(searchIndex - (state.recordsPerPage - 1), 0);
        const toRecord = Math.min(fromRecord + state.recordsPerPage - 1, lastRecordIndex);
        const records = await fetchRecords(fromRecord, toRecord);
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
            const searchPageIndex = state.searchedIndex % state.recordsPerPage;
            await displayData(state.currentFirstRecordIndex, state.recordsPerPage);
        } else {
            state.searchedIndex = null;
        }
    } catch (error) {
        throw error;
    } finally {
        $("#loader").hide();
        $("#tableWrapper").show();
    }
}

async function adjustedResize() {
    const newScreenHeight = window.innerHeight;
    const totalRecCount = await totalRecords();
    state.recordsPerPage = await screenCalculations(newScreenHeight);
    if (state.searchedIndex !== null) {
        const searchPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
        const searchPageIndex = state.searchedIndex % state.recordsPerPage;
        state.currentFirstRecordIndex = (searchPage - 1) * state.recordsPerPage;
        currentPage = searchPage;
        state.searchedIndex = state.currentFirstRecordIndex + searchPageIndex;
    } else if (state.currentFirstRecordIndex >= totalRecCount) {
        const lastPageFirstRecordIndex = Math.max(totalRecCount - state.recordsPerPage, 0);
        currentPage = Math.ceil((lastPageFirstRecordIndex + 1) / state.recordsPerPage);
        state.currentFirstRecordIndex = lastPageFirstRecordIndex;
    }
    let fromRecord = state.currentFirstRecordIndex;
    displayData(fromRecord, state.recordsPerPage);
}

async function updatePages() {
	const screenHeight = window.innerHeight;
	const recordCount = await totalRecords();
	state.recordsPerPage = await screenCalculations(screenHeight);
	$("#loader").show();
	$("#tableWrapper").hide();
    if (state.searchedIndex !== null) {
        const searchPage = Math.ceil((state.searchedIndex + 1) / state.recordsPerPage);
        const searchPageIndex = state.searchedIndex % state.recordsPerPage;
        state.searchedIndex = (searchPage - 1) * state.recordsPerPage + searchPageIndex;
        displayData(
            Math.max(state.searchedIndex - state.recordsPerPage + 1, 0), state.recordsPerPage);
    } else {
        const previousFirstRecordIndex = state.currentFirstRecordIndex;
        currentPage = Math.ceil((state.currentFirstRecordIndex + 1) / state.recordsPerPage);
        displayData(state.currentFirstRecordIndex, state.recordsPerPage);
    }
	$("#loader").hide();
	$("#tableWrapper").show();
}

async function screenCalculations(screenHeight: number): Promise<number> {
	const estimatedRowHeightFactor = 1;
	const estimatedRowHeight = estimatedRowHeightFactor * 50;
	const totalRecCount = await totalRecords();
	let recordsPerPage = Math.floor(screenHeight / estimatedRowHeight) - 1;
	recordsPerPage = Math.max(recordsPerPage - 2, 1);
	return recordsPerPage;
}

async function togglePaginationButtons() {
	try {
		const totalRecCount = await totalRecords();
		const isFirstPage = state.currentFirstRecordIndex <= 1;
		const isLastPage = state.currentFirstRecordIndex + state.recordsPerPage >= totalRecCount;
		$("#prevPageButton").toggle(!isFirstPage);
		$("#nextPageButton").toggle(!isLastPage);
	} catch (error) {
		console.error("Error fetching total record count: ", error);
	}
}

async function updateSearchInputMax() {
	try {
		const searchInput = document.getElementById("searchInput") as HTMLInputElement;
		const totalRecCount = await totalRecords();
		searchInput.max = (totalRecCount - 1).toString();
	} catch (error) {
		throw (error);
	}
}

window.onload = async function () {
	$("#loader").hide();
	adjustedResize();
	displayColumns();
	updateSearchInputMax();
	$("#searchInput").on("keydown", function (e) {
		if (e.key === "e" || e.key === "E" || e.key === "."
			|| e.key === "+" || e.key === "-") {
			e.preventDefault();
		}
	});
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
	});
	$("#prevPageButton").on("click", async () => {
		state.searchedIndex = null;
		const lastRecordOnFirstPage = state.recordsPerPage;
		const shouldGoToDefaultFirstPage =
			state.currentValueOfFirstRecord > 1 &&
			state.currentValueOfFirstRecord <= lastRecordOnFirstPage;
		if (shouldGoToDefaultFirstPage) {
			currentPage = 1;
			state.currentFirstRecordIndex = 0;
		} else if (currentPage > 1) {
			currentPage--;
			state.currentFirstRecordIndex -= state.recordsPerPage;
		}
		let fromRecord = state.currentFirstRecordIndex;
		$("#nextPageButton").hide();
		$("#prevPageButton").hide();
		$("#tableWrapper").hide();
		$("#loader").show();
		displayData(fromRecord, state.recordsPerPage);
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
		try {
			state.searchedIndex = null;
			const totalRecCount = await totalRecords();
			if (currentPage * state.recordsPerPage < totalRecCount) {
				currentPage++;
				state.currentFirstRecordIndex += state.recordsPerPage;
			}
			const lastPageFirstRecordValue = totalRecCount - state.recordsPerPage + 1;
			const displayedRecordsIncludeHighValues =
				state.currentFirstRecordIndex >= lastPageFirstRecordValue;
			if (displayedRecordsIncludeHighValues) {
				const nextPage = Math.ceil(totalRecCount / state.recordsPerPage);
				currentPage = nextPage;
				state.currentFirstRecordIndex = (currentPage - 1) * state.recordsPerPage;
			}
			let fromRecord = state.currentFirstRecordIndex;
			$("#nextPageButton").hide();
			$("#prevPageButton").hide();
			$("#tableWrapper").hide();
			$("#loader").show();
			displayData(fromRecord, state.recordsPerPage);
			setTimeout(() => {
				$("#loader").hide();
				$("#tableWrapper").show();
				$("#prevPageButton").show();
				if (state.currentFirstRecordIndex === (totalRecCount - state.recordsPerPage)) {
					$("#nextPageButton").hide();
				} else if (currentPage < totalPages) {
					$("#nextPageButton").show();
				}
			}, 1000);
		} catch (error) {
			throw (error);
		}
	});
}
window.addEventListener("resize", debounce(async () => {
	try {
		$("#tableWrapper").hide();
		$("#loader").show();
		await updatePages();
		const totalRecCount = await totalRecords();
		if (currentPage * state.recordsPerPage > totalRecCount - 1) {
			const lastPage = Math.ceil(totalRecCount / state.recordsPerPage);
			currentPage = lastPage;
			state.currentFirstRecordIndex = (lastPage - 1) * state.recordsPerPage;
			await displayData(state.currentFirstRecordIndex, state.recordsPerPage);
		}
		$("#loader").hide();
		$("#tableWrapper").show();
	} catch (error) {
		throw error;
	}
}, 150));
