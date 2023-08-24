window.onload = async function () {
  $("#loader").hide();
  await fetchTotalRecordCount();
  updateRecordsPerPage();
  fetchAndDisplayColumns();
};
// Global variables
const IMQS: string = "http://localhost:2050";
let totalRecordCount: number = 1000000;
let totalPages: number;
let currentValueOfFirstRecord: number = 1;
let currentFirstRecordIndex: number = 1;
let currentPage: number = 1;
let recordsPerPage: number;
let resizeTimeout: number | undefined;
let searchResultDisplay = false;
let isSearchMode = false;
let searchResultIndexes: number[] = [];
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
    if (searchResultIndexes.length > 0 && searchResultIndexes[0] === 999999) {
      // When searching for record 999999, consider it the last page
      totalPages = Math.ceil((totalRecordCount - 1) / recordsPerPage) + 1;
    } else {
      totalPages = Math.ceil(totalRecordCount / recordsPerPage);
    }

    // Display initial page
    await displayPageData((currentPage - 1) * recordsPerPage, recordsPerPage);
  } catch (error) {
    console.log("ERROR:", error);
  }
}
async function displayPageData(fromRecord: number, recordsToDisplay: number) {
  const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage} out of ${nextPage}`);
  try {
    // Ensure fromRecord is never negative
    fromRecord = Math.max(fromRecord, 0);
    const maxRecordsToDisplay = Math.min(
      totalRecordCount - fromRecord,
      recordsToDisplay
    );
    let response = await fetch(
      `${IMQS}/records?from=${fromRecord}&to=${
        fromRecord + maxRecordsToDisplay - 1
      }`
    );
    let data = await response.json();
    let tableData = "";
    // Update the value of the first record dynamically
    const firstRecordValue = parseInt(data[0][0]);
    const firstRecordIndex = fromRecord;
    if (currentPage * recordsPerPage > totalRecordCount) {
      recordsToDisplay = totalRecordCount - fromRecord;
    }
    currentValueOfFirstRecord = firstRecordValue;
    currentFirstRecordIndex = firstRecordIndex;
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
  const fromRecord = currentFirstRecordIndex;
  const recordsToDisplay = recordsPerPage;
  $("#loader").show();
  $("#tableWrapper").hide();
  await displayPageData(fromRecord, recordsToDisplay);
  $("#currentPageNumber").text(`Page ${currentPage}`);
  $("#loader").hide();
  $("#tableWrapper").show();
}
window.addEventListener("resize", async () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    await updateRecordsPerPage();
  }, 300);
});
async function searchRecordByValue(searchValue: any) {
  try {
    searchValue = parseInt(searchValue);
    await fetchTotalRecordCount();
    let targetPage = Math.ceil((searchValue + 1) / recordsPerPage);
    targetPage = Math.min(targetPage, totalPages);
    // Fetch records for the target page
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
    // Check if the search value exists within the fetched records
    for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
      const record = records[recordIndex];
      const idValue = parseInt(record[0]);
      if (idValue === searchValue) {
        foundIndex = fromRecord + recordIndex;
        break;
      }
    }
    if (foundIndex !== -1) {
      currentPage = targetPage; // If the search result corresponds to the first record on the current page
      if (currentPage === targetPage && foundIndex === currentFirstRecordIndex) {
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

  let fromRecord = currentFirstRecordIndex;
  await displayPageData(fromRecord, recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage}`);
});
