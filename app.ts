window.onload = function () {
  // displayPageData(1, 26);
  updateRecordsPerPage();
  fetchTotalRecordCount();
  fetchAndDisplayColumns();
  window.addEventListener("resize", updateRecordsPerPage);
};
// Global variables
const IMQS: string = "http://localhost:2050";
let totalRecordCount: number;
let currentPage: number = 1;
let recordsPerPage: number = 32;

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

async function goToPage(pageNumber: number): Promise<void> {
  currentPage = pageNumber;
  let fromRecord = (currentPage - 1) * recordsPerPage;
  await displayPageData(fromRecord, recordsPerPage);
}

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

async function displayPageData(
  fromRecord: number,
  recordsToDisplay: number
): Promise<void> {
  try {
    let response = await fetch(
      `${IMQS}/records?from=${fromRecord}&to=${
        fromRecord + recordsToDisplay - 1
      }`
    );
    let data: any[] = await response.json();
    let tableData = "";
    data.forEach((record: string[]) => {
      tableData += "<tr>";
      record.forEach((value: string) => {
        tableData += `<td>${value}</td>`;
      });
      tableData += "</tr>";
    });
    // Adjust recordsToDisplay for the last page
    if (currentPage * recordsPerPage > totalRecordCount) {
      recordsToDisplay = totalRecordCount % recordsPerPage;
    }
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

// Function to calculate and update records per page based on screen height
async function updateRecordsPerPage() {
  const screenHeight = window.innerHeight;
  const estimatedRowHeight = 32;
  const oldRecordsPerPage = recordsPerPage;

  // $("#loader").show();

  recordsPerPage = Math.floor(screenHeight / estimatedRowHeight);
  recordsPerPage = Math.max(recordsPerPage - 1, 1);

  // console.log(`Calculating...`);

  // Adding a delay
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  if (recordsPerPage !== oldRecordsPerPage) {
    // Show a loader while fetching and displaying data
    // $("#loader").show();

    console.log(`Fetching and displaying data...`);

    // Simulate a delay for fetching and displaying data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`Records per page: ${recordsPerPage}`);

    // Hide the loader after data is displayed
    $("#loader").hide();

    // Calculate the new fromRecord based on the current page
    const fromRecord = (currentPage - 1) * recordsPerPage;

    // Display the new data
    await displayPageData(fromRecord, recordsPerPage);
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
      let targetPage;
      let fromValue;
      let recordsToDisplay;
      if (searchValue >= 999992) {
        // Display the last 27 records
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
        rowElement.css("background-color", "yellow");
      });
      $("#searchResultsMessage").html(
        `<div>Showing search Results for Record number ${searchValue}</div>`
      );
    } else {
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
