window.onload = async function () {
  $("#loader").hide();
  await fetchTotalRecordCount();
  updateRecordsPerPage();
  fetchAndDisplayColumns();
};
// Global variables
const IMQS: string = "http://localhost:2050";
let totalRecordCount: number;
let currentPage: number = 1;
let recordsPerPage: number = 25;
let resizeTimeout: number | undefined;
let searchResultDisplay = false;
let isSearchMode = false;
let searchResultIndexes: number[] = [];
let totalPages: number;
let currentValueOfFirstRecord: number = 1;
let currentFirstRecordIndex: number = 1;

async function fetchAndDisplayColumns(): Promise<void> {
  try {
    let columns: string[] = await (await fetch(`${IMQS}/columns`)).json();
    let tableHeaderRow = $("#tableHeaderRow");
    columns.forEach((columnName: string) => {
      let th = document.createElement("th");
      th.textContent = columnName;
      tableHeaderRow.append(th);
    });
    if (totalRecordCount === 1 && searchResultIndexes.length > 0) {
      // When there's only one record (search result), consider it the last page
      totalPages = 1;
    } else if (
      searchResultIndexes.length > 0 &&
      searchResultIndexes[0] === 999999
    ) {
      // When searching for record 999999, consider it the last page
      totalPages = Math.ceil((totalRecordCount - 1) / recordsPerPage) + 1;
    } else {
      totalPages = Math.ceil(totalRecordCount / recordsPerPage);
    }
    await fetchTotalRecordCount();
    totalPages = Math.ceil(totalRecordCount / recordsPerPage);
    recordsPerPage = Math.min(recordsPerPage, totalRecordCount);
    await displayPageData((currentPage - 1) * recordsPerPage, recordsPerPage);
  } catch (error) {
    console.log("ERROR:", error);
  }
}
async function displayPageData(fromRecord: number, recordsToDisplay: number) {
  const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage} out of ${nextPage}`);
  try {
    // Cap fromRecord at 999999
    fromRecord = Math.min(fromRecord, 999999);

    // Calculate the maximum number of records that can be displayed
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
      // Adjust recordsToDisplay for the last page
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
async function fetchTotalRecordCount(): Promise<void> {
  try {
    let recordCount: number = await (await fetch(`${IMQS}/recordCount`)).json();
    totalRecordCount = recordCount;
    $("#totalRecordCount").text(totalRecordCount);
  } catch (error) {
    console.error("Error fetching total record count:", error);
  }
}
async function updateRecordsPerPage() {
  const screenHeight = window.innerHeight;
  const estimatedRowHeight = 32;
  const oldRecordsPerPage = recordsPerPage;
  // Calculate new recordsPerPage
  recordsPerPage = Math.floor(screenHeight / estimatedRowHeight);
  recordsPerPage = Math.min(recordsPerPage - 3, 999999);
  recordsPerPage = Math.max(recordsPerPage, 1);
  // Calculate the new current page based on the value of the first record
  let valueOfFirstRecord = currentValueOfFirstRecord;
  if (valueOfFirstRecord === 0) {
    valueOfFirstRecord = 1; // Treat 0 as 1
  }
  currentPage = Math.ceil(valueOfFirstRecord / recordsPerPage);
  // Fetch the total record count
  await fetchTotalRecordCount();
  const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
  // Adjust currentPage if it exceeds the total number of pages
  currentPage = Math.min(currentPage, nextPage);
  // Update the display
  await displayPageData((currentPage - 1) * recordsPerPage, recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage} out of ${totalPages}`);
}
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateRecordsPerPage();
  }, 300);
});
async function searchRecordByValue(searchValue: any) {
  try {
    searchValue = parseInt(searchValue);
    await fetchTotalRecordCount();

    // Calculate the target page and index within that page for the search value
    const targetPage = Math.ceil(searchValue / recordsPerPage);
    const indexWithinPage = (searchValue - 1) % recordsPerPage;

    // Fetch records for the target page
    const fromRecord = (targetPage - 1) * recordsPerPage;
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
      // Update currentPage and display the search results
      currentPage = targetPage;
      await displayPageData(fromRecord, recordsPerPage);

      // Update the search result indexes and message
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
  await searchRecordByValue(searchValue);
  // Set background color for the rows containing search results
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
  } else {
    // If on the first page, navigate to the last page
    currentPage = totalPages;
  }

  let fromRecord = (currentPage - 1) * recordsPerPage;
  await displayPageData(fromRecord, recordsPerPage);
  $("#currentPageNumber").text(`Page ${currentPage} out of ${totalPages}`);
});
$("#nextPageButton").on("click", async () => {
  isSearchMode = false;
  searchResultDisplay = false;
  searchResultIndexes = [];

  const nextPage = Math.ceil(totalRecordCount / recordsPerPage);

  if (currentPage < nextPage) {
    currentPage++;
  } else {
    // If on the last page, navigate to the first page
    currentPage = 1;
  }

  let fromValue;
  let recordsToDisplay;

  // Check if it's the last page
  if (currentPage === nextPage) {
    fromValue = (currentPage - 1) * recordsPerPage;
    recordsToDisplay = totalRecordCount % recordsPerPage || recordsPerPage;
  } else {
    fromValue = (currentPage - 1) * recordsPerPage;
    recordsToDisplay = recordsPerPage;
  }

  await displayPageData(fromValue, recordsToDisplay);
  $("#currentPageNumber").text(`Page ${currentPage} out of ${totalPages}`);
});
