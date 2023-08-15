window.onload = function () {
  // Global variables
  const IMQS: string = "http://localhost:2050";
  let totalRecordCount: number;
  let currentPage: number =  1;
  const recordsPerPage: number = 26;

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
      await goToPage(currentPage - 1);
    }
  });
  
  $("#nextPageButton").on("click", async () => {
    const nextPage = Math.ceil(totalRecordCount / recordsPerPage);
    if (currentPage < nextPage) {
      await goToPage(currentPage + 1);
    }
  });
  

  async function displayPageData(
    fromRecord: number,
    recordsToDisplay: number
  ): Promise<void> {
    try {
      let response = await fetch(
        `${IMQS}/records?from=${fromRecord}&to=${fromRecord + recordsToDisplay - 1}`
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
      $("#tableBody").html(tableData);
    } catch (error) {
      console.log("ERROR:", error);
    }
  }
  

  // This displays the actual NUMBER of Total records on the html
  async function fetchTotalRecordCount(): Promise<void> {
    try {
      let recordCount: number = await (
        await fetch(`${IMQS}/recordCount`)
      ).json();
      totalRecordCount = recordCount;
      $("#totalRecordCount").text(totalRecordCount);
    } catch (error) {
      console.error("Error fetching total record count:", error);
    }
  }

  // Displays records from 1 to 30 on the initial page
  displayPageData(1, 30);

  fetchTotalRecordCount();
  fetchAndDisplayColumns();

  // Filter to display range from a certain ID to another ID
  $("#rangeForm").submit(async (event) => {
    event.preventDefault();
    let fromInput = $("#fromInput");
    let toInput = $("#toInput");
    let from = parseInt((fromInput.val() as string) || "0");
    let to = parseInt((toInput.val() as string) || "0");

    if (!isNaN(from) && !isNaN(to)) {
      await fetchRecords(from, to);
    }
  });

  async function fetchRecords(from: number, to: number): Promise<void> {
    try {
      let response = await fetch(`${IMQS}/records?from=${from}&to=${to}`);
      let data: any[] = await response.json();

      let tableData = "";
      for (let i = 0; i < data.length; i++) {
        let record = data[i];
        tableData += "<tr>";
        for (let j = 0; j < record.length; j++) {
          let value = record[j];
          tableData += `<td>${value}</td>`;
        }
        tableData += "</tr>";
      }
      $("#tableBody").html(tableData);

      // Display record range
      if (data.length > 0) {
        let firstRecordID = data[0][0];
        let lastRecordID = data[data.length - 1][0];
        $("#recordRange").html(
          `<div>Displaying from Record <span>${firstRecordID}</span> to Record <span>${lastRecordID}</span> </div>`
        );
      } else {
        $("#recordRange").html("No records found.");
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  $("#searchForm").submit(function (e) {
    e.preventDefault();
    let searchValue = $("#searchInput").val();

    if (typeof searchValue === "string") {
      searchValue = searchValue.toUpperCase();
    }

    // Reset previous search styling and messages
    $("#tableHeaderRow th").css("background-color", "");
    $("#tableBody td").css({
      "background-color": "",
      color: "",
      border: "",
    });

    $("#searchResultsMessage").text("");

    // Adjust display and height of search result rows
    $("#tableBody tr").each(function () {
      let row = $(this);
      let matchingCells = row.find("td").filter(function () {
        let cellText: any = $(this).text();
        return cellText.toUpperCase().includes(searchValue);
      });

      if (matchingCells.length > 0) {
        row.show();
        matchingCells.css({
          "background-color": "var(--quaternary-color)",
          color: "var(--tertiary-color)",
          "font-weight": "900",
          border: "2px solid var(--secondary-color)",
        });

        // Set height and display property for search result rows
        row.css({
          height: "auto"
  
        });
      } else {
        // row.hide();
        console.log("ERROR:");
      }
    });

    // Display search results message
    $("#searchResultsMessage").html(
      `<div>Results for "<span>${searchValue}</span>" </div>`
    );
  }); 
};


  