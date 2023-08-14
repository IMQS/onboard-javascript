window.onload = function () {
    const IMQS: string = "http://localhost:2050";
    let totalRecordCount: number;
  
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
  
        await displayPageData(0, totalRecordCount);
      } catch (error) {
        console.log("ERROR:", error);
      }
    };
  
    async function displayPageData(
      recordID: number,
      totalRecordCount: number
    ): Promise<void> {
      try {
        let response = await fetch(
          `${IMQS}/records?from=${recordID}&to=${totalRecordCount}`
        );
  
        let data: any[] = await response.json();
        console.log(data);
  
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
    };
  
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
  
    // Displays records from 1 to 999 on the initial page
    displayPageData(1, 999);
  
    fetchTotalRecordCount();
    fetchAndDisplayColumns();
  
    // Function to sort the IDS in the first column into ascending order ,
    // it converts the strings to numbers then filters it
  
    async function sortTableAsc(): Promise<void> {
      try {
        let rows = $("#tableBody tr").get();
        rows.sort((a, b) => {
          let aValue = parseFloat($(a).children("td:first").text()) || 0;
          let bValue = parseFloat($(b).children("td:first").text()) || 0;
          return aValue - bValue;
        });
        $("#tableBody").append(rows);
      } catch (error) {
        console.log("Sorting Ascending Error:", error);
      }
    };
  
    $("#sortAscButton").on("click", async () => {
      await sortTableAsc();
    });
  
    // Function to sort the IDS in the first column into descending order ,
    // it converts the strings to numbers then filters it
  
    async function sortTableDesc(): Promise<void> {
      try {
        let rows = $("#tableBody tr").get();
        rows.sort((a, b) => {
          let aValue = parseFloat($(a).children("td:first").text()) || 0;
          let bValue = parseFloat($(b).children("td:first").text()) || 0;
          return bValue - aValue;
        });
        $("#tableBody").append(rows);
      } catch (error) {
        console.log("Sorting Descending Error:", error);
      }
    };
  
    $("#sortDescButton").on("click", async () => {
      await sortTableDesc();
    });
  
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
            `<li>Displaying from Record <span>${firstRecordID}</span> to Record <span>${lastRecordID}</span> </li>`
          );
          $("#recordRange").css({
            border: "5px dotted var(--primary-color)",
            padding: "1rem",
          });
        } else {
          $("#recordRange").html("No records found.");
        }
      } catch (error) {
        console.log("ERROR:", error);
      }
    };
  
    $("#searchForm").submit(function (event) {
      event.preventDefault();
      let searchValue = $("#searchInput").val();
  
      if (searchValue !== undefined) {
        searchValue = searchValue.toString().toUpperCase();
  
        // Allows the css to have empty value before the css styling to the search results of the search has been done
        $("#tableHeaderRow th").css("background-color", "");
        $("#tableBody td").css({
          "background-color": "",
          color: "",
          border: "",
        });
        $("#searchResultsMessage").text("");
  
        // This hides all the th and td that is not corresponding to the search results
        $("#tableHeaderRow th").each(function () {
          let columnText = $(this).text().toUpperCase();
          if (columnText === searchValue || columnText === "ID") {
            $(this).show();
  
            // This displays the matching result of the records searched
            let columnIndex = $(this).index();
            $("#tableBody tr").each(function () {
              let row = $(this);
              row.find("td").eq(columnIndex).show();
              row.find("td").eq(columnIndex).css({
                "background-color": "var(--quaternary-color)",
                color: "var(--tertiary-color)",
                "font-weight": "900",
                border: "2px solid var(--secondary-color)",
              });
            });
  
            // Display search results message
            $("#searchResultsMessage").html(
              `<li>Results for "<span>${searchValue}</span>" </li>`
            );
          }
          $("#searchResultsMessage").css({
            border: "5px dotted var(--primary-color)",
            padding: "1rem",
          });
        });
      }
    });
  };
  