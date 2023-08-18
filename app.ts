window.onload = function () {
  updateRecordsPerPage();
  fetchTotalRecordCount();
  fetchAndDisplayColumns();
};

// Global variables
const IMQS: string = "http://localhost:2050";
let totalRecordCount: number;
let currentPage: number = 1;
let recordsPerPage: number = 32;
let resizeTimeout: number | undefined;
let searchResultDisplay = false;
let searchResultIndexes: number[] = [];

// Displaying the columns and creating the th dynamically as the columns
async function fetchAndDisplayColumns(): Promise<void> {
  try {
    let columns: string[] = await (await fetch(`${IMQS}/columns`)).json();
    let tableHeaderRow = $("#tableHeaderRow");
    columns.forEach((columnName: string) => {
      let th = document.createElement("th");
      th.textContent = columnName;
      tableHeaderRow.append(th);
    });
    await fetchTotalRecordCount();
    await displayPageData((currentPage - 1) * recordsPerPage, recordsPerPage);
  } catch (error) {
    console.log("ERROR:", error);
  }
}
async function displayPageData(fromRecord: number, recordsToDisplay: number) {
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

    if (currentPage * recordsPerPage > totalRecordCount) {
      // Adjust recordsToDisplay for the last page
      recordsToDisplay = totalRecordCount - fromRecord;
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

// This displays the actual NUMBER of Total records on the html
async function fetchTotalRecordCount(): Promise<void> {
  try {
    let recordCount: number = await (await fetch(`${IMQS}/recordCount`)).json();
    totalRecordCount = recordCount;
    $("#totalRecordCount").text(totalRecordCount);
  } catch (error) {
    console.error("Error fetching total record count:", error);
  }
}

// Function to handle resizing events
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateRecordsPerPage();
  }, 300);
}

// Attach the debounced handler to the window resize event
window.addEventListener("resize", handleResize);

// Function to calculate and update records per page based on screen height
async function updateRecordsPerPage() {
  const screenHeight = window.innerHeight;
  const estimatedRowHeight = 32;
  const oldRecordsPerPage = recordsPerPage;

  // Show the loader while calculating
  // $("#loader").show();

  recordsPerPage = Math.floor(screenHeight / estimatedRowHeight);
  recordsPerPage = Math.min(recordsPerPage - 3, 999999);
  recordsPerPage = Math.max(recordsPerPage, 1);

  // Simulate a delay for calculation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (searchResultDisplay) {
    // If a search result is being displayed, adjust fromRecord accordingly
    const searchIndex = searchResultIndexes[0];
    const searchPage = Math.ceil((searchIndex + 1) / recordsPerPage);
    const newFromRecord = (searchPage - 1) * recordsPerPage;
    const newToRecord = newFromRecord + recordsPerPage - 1;
    const actualFromRecord = Math.min(newFromRecord + 1, totalRecordCount);
    const actualToRecord = Math.min(newToRecord + 1, totalRecordCount);

    console.log(
      `Displaying search result from ${actualFromRecord} to ${actualToRecord}`
    );

    // Display the new data
    await displayPageData(newFromRecord, recordsPerPage);
    $("#tableBody tr").css("background-color", "");
    searchResultIndexes.forEach((searchIndex: any) => {
      const rowIndex = searchIndex % recordsPerPage;
      const rowElement = $("#tableBody tr").eq(rowIndex);
      rowElement.css("background-color", "yellow");
    });
  } else if (recordsPerPage !== oldRecordsPerPage) {
    // $("#loader").show();

    recordsPerPage = Math.floor(screenHeight / estimatedRowHeight);
    recordsPerPage = Math.min(recordsPerPage - 3, 999999);
    recordsPerPage = Math.max(recordsPerPage, 1);

    // Simulate a delay for calculation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (recordsPerPage !== oldRecordsPerPage) {
      console.log(`Fetching and displaying data...`);

      // Simulate a delay for fetching and displaying data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate the new fromRecord based on the current page
      const fromRecord = (currentPage - 1) * recordsPerPage;
      const toRecord = fromRecord + recordsPerPage - 1;

      const actualFromRecord = Math.min(fromRecord + 1, totalRecordCount);
      const actualToRecord = Math.min(toRecord + 1, totalRecordCount);

      console.log(
        `Displaying records from ${actualFromRecord} to ${actualToRecord}`
      );

      $("#loader").hide();

      // Display the new data
      await displayPageData(fromRecord, recordsPerPage);
    }
  }
}

$("#searchForm").submit(async function (e) {
  e.preventDefault();
  let searchValue = parseInt($("#searchInput").val() as string); // Convert to number
  $("#loader").show();
  $("#searchResultsMessage").show();
  $("#tableWrapper").hide();
  try {
    let response = await fetch(
      `${IMQS}/records?from=0&to=${totalRecordCount - 1}`
    );
    let allRecords: any[] = await response.json();
    let searchIndexes = allRecords.reduce(
      (indexes: number[], record: any[], index: number) => {
        let idValue = parseInt(record[0]);
        if (idValue === searchValue) {
          indexes.push(index);
        }
        return indexes;
      },
      []
    );
    if (searchIndexes.length > 0) {
      searchResultDisplay = true;
      searchResultIndexes = searchIndexes;
      let targetPage: any;
      let fromValue: any;
      let recordsToDisplay: any;
      if (searchValue >= 999992) {
        // Display the last 7 records
        targetPage = Math.ceil(totalRecordCount / recordsPerPage);
        fromValue = Math.max((targetPage - 1) * recordsPerPage, 0);
        recordsToDisplay = totalRecordCount - fromValue;
      } else {
        targetPage = Math.ceil((searchIndexes[0] + 1) / recordsPerPage);
        fromValue = (targetPage - 1) * recordsPerPage;
        recordsToDisplay = recordsPerPage;
      }
      currentPage = targetPage;
      await displayPageData(fromValue, recordsToDisplay);
      // Reset previous row background color
      $("#tableBody tr").css("background-color", "");
      searchIndexes.forEach((searchIndex: any) => {
        let rowIndex = searchIndex % recordsPerPage;
        let rowElement = $("#tableBody tr").eq(rowIndex);
        rowElement.css("background-color", "var(--results-color)");
      });
      $("#searchResultsMessage").html(
        `<div>Showing search Results for Record number ${searchValue}</div>`
      );
    } else {
      searchResultDisplay = false;
      $("#tableBody").html("");
      $("#recordRange").html("No records found.");
      $("#searchResultsMessage").html(
        `<div>No results found for ID "<span>${searchValue}</span>"</div>`
      );
    }
  } catch (error) {
    console.log("ERROR:", error);
  } finally {
    $("#loader").hide();
    $("#tableWrapper").show();
  }
});

$("#prevPageButton").on("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    let fromRecord = (currentPage - 1) * recordsPerPage;
    await displayPageData(fromRecord, recordsPerPage);
  }
});

$("#nextPageButton").on("click", async () => {
  const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
  if (currentPage < nextPage) {
    let fromValue;
    let recordsToDisplay;

    // Check if it's the last page
    if (currentPage === nextPage - 1) {
      fromValue = currentPage * recordsPerPage;
      recordsToDisplay = totalRecordCount - fromValue;
    } else {
      fromValue = currentPage * recordsPerPage;
      recordsToDisplay = recordsPerPage;
    }

    currentPage++;

    await displayPageData(fromValue, recordsToDisplay);
  }
});
