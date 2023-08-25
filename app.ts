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

window.addEventListener("resize", async () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    await updateRecordsPerPage();
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
      `${IMQS}/records?from=${fromRecord}&to=${fromRecord + maxRecordsToDisplay - 1}`
    );
    let data = await response.json();
    let tableData = "";
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
      searchResultDisplay = false; // Reset the search result display flag
    }
    // Calculate the position of the search result on the current page
    const searchIndexOnPage = searchResultIndexes[0] - fromRecord;
    // Adjust fromRecord based on the search result position and screen size
    if (!isSearchMode) {
      const firstRecordValue = parseInt(data[0][0]);
      const firstRecordIndex = fromRecord;
      if (currentPage * recordsPerPage > totalRecordCount) {
        recordsToDisplay = totalRecordCount - fromRecord;
      }
      currentValueOfFirstRecord = firstRecordValue;
      currentFirstRecordIndex = firstRecordIndex;
    } else {
      // Adjust fromRecord to keep the search result in view during navigation
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
async function updateRecordsPerPage() {
  const screenHeight = window.innerHeight;
  const estimatedRowHeightFactor = totalRecordCount / 1000000;
  const estimatedRowHeight = estimatedRowHeightFactor * 50;
  recordsPerPage = Math.floor(screenHeight / estimatedRowHeight);
  recordsPerPage = Math.max(recordsPerPage - 2, 1);

  let currentPageRecordsToDisplay = recordsPerPage; // Initialize to default recordsPerPage
  if (isSearchMode && searchResultIndexes.length > 0) {
    const searchIndexOnPage = searchResultIndexes[0] % recordsPerPage;
    currentPage = Math.ceil((searchResultIndexes[0] + 1) / recordsPerPage);
    currentFirstRecordIndex = (currentPage - 1) * recordsPerPage;
    // Adjust recordsToDisplay if search result is on the last page
    if (currentPage === totalPages && totalRecordCount % recordsPerPage !== 0) {
      currentPageRecordsToDisplay = totalRecordCount % recordsPerPage;
    }
  }
  let adjustedFromRecord = currentFirstRecordIndex;
  $("#loader").show();
  $("#tableWrapper").hide();
  await displayPageData(adjustedFromRecord, currentPageRecordsToDisplay);
  $("#currentPageNumber").text(`Page ${currentPage}`);
  $("#loader").hide();
  $("#tableWrapper").show();
  // Check if the current displayed records include values beyond the total number of records
  const lastPageFirstRecordValue = totalRecordCount - recordsPerPage + 1;
  const displayedRecordsIncludeHighValues =
    currentFirstRecordIndex >= lastPageFirstRecordValue;
  // Go to default last page for the current screen size if the condition is met
  if (displayedRecordsIncludeHighValues) {
    currentPage = totalPages;
    currentFirstRecordIndex = (currentPage - 1) * recordsPerPage;
    adjustedFromRecord = currentFirstRecordIndex;
    await displayPageData(adjustedFromRecord, recordsPerPage);
  }
}
async function handleSpecialResize() {
  const recordsPerPage = 16;
  
  // Calculate the last record of the final page
  const lastRecordOfFinalPage = (Math.ceil(totalRecordCount / recordsPerPage)) * recordsPerPage;

  // Calculate the first record of the final page
  const firstRecordOfFinalPage = lastRecordOfFinalPage - recordsPerPage + 1;

  // Check if the first record falls within the range of the final page
  if (
    currentValueOfFirstRecord >= firstRecordOfFinalPage &&
    currentValueOfFirstRecord <= lastRecordOfFinalPage
  ) {
    // Calculate the special first record index as the first record of the final page
    const specialFirstRecordIndex = Math.max(firstRecordOfFinalPage - recordsPerPage + 1, 0);

    // Force the display to the default last page
    currentPage = totalPages;
    currentFirstRecordIndex = specialFirstRecordIndex;
    isSearchMode = false;
    searchResultDisplay = false;
    searchResultIndexes = [];
    let fromRecord = currentFirstRecordIndex;
    await displayPageData(fromRecord, recordsPerPage);
    $("#currentPageNumber").text(`Page ${currentPage}`);
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
      currentPage = targetPage;
      if (
        currentPage === targetPage &&
        foundIndex === currentFirstRecordIndex
      ) {
        await displayPageData(currentFirstRecordIndex, recordsPerPage);
      } else {
        await displayPageData(fromRecord, recordsPerPage);
      }
      isSearchMode = true;
      searchResultDisplay = true;
      searchResultIndexes = [foundIndex];
      $("#searchResultsMessage").html(
        `<div>Showing search Results for Record number ${searchValue}</div>`
      );
      console.log(searchValue);
    } else {
      searchResultDisplay = false;
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
  isSearchMode = false;
  searchResultDisplay = false;
  searchResultIndexes = [];
  if (currentPage > 1) {
    currentPage--;
    currentFirstRecordIndex -= recordsPerPage;
  }
  let fromRecord = currentFirstRecordIndex;
  await displayPageData(fromRecord, recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage}`);
});
$("#nextPageButton").on("click", async () => {
  isSearchMode = false;
  searchResultDisplay = false;
  searchResultIndexes = [];
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

