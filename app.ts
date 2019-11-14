//Loads the table to the screen
window.onload = () => GetColumnNames();

//Variable declarations
let totalRecordCount;
let columnNames: string[];
let records: any[];
let from: number = 1;
let to: number = 30;

//Function to retrieve total amount of records
function GetNumberOfRecords() {
  $.ajax({
    url: "/recordCount",
    type: "GET",
    timeout: 12000,
    dataType: "text"
  })
    .done(function(responseText: any) {
      totalRecordCount = responseText;
    })
    .fail(function() {
      alert("Could not retrieve total record number");
    });
}

//function to retrieve column names
function GetColumnNames() {
  $.ajax({
    url: "/columns",
    type: "GET",
    timeout: 12000,
    dataType: "JSON"
  })
    .done(function(responseJSON: any) {
      columnNames = responseJSON;
      Sync();
    })
    .fail(function() {
      alert("Could not display column names");
    });
}

//Function to retrieve the record data
function GetActualRecords() {
  $.ajax({
    url: "/records?from=" + from + "&to=" + to,
    timeout: 12000,
    dataType: "JSON"
  })
    .done(function(responseRecords: any) {
      records = responseRecords;
      NextSync();
    })
    .fail(function() {
      alert("No available records for your selection");
    });
}

//Function to sync API calls
function Sync() {
  GetActualRecords();
}

//Function to sync API calls
function NextSync() {
  BuildTable();
}

//Function builds the table and populates with data from the API calls
function BuildTable() {
  RemoveTable();

  const body = document.getElementsByTagName("body")[0];

  const ourTable = document.createElement("table");
  ourTable.setAttribute("id", "Table");

  const thead = document.createElement("thead");
  ourTable.appendChild(thead);

  //Column names are created for the table
  for (let c = 0; c < columnNames.length; c++) {
    thead
      .appendChild(document.createElement("th"))
      .appendChild(document.createTextNode(columnNames[c]));
  }
  //Cells are created and populated with data
  for (let i = 0; i < records.length; i++) {
    const tableRow = document.createElement("tr");
    ourTable.appendChild(tableRow);

    const innerArrayLength = records[i].length;

    for (let j = 0; j < innerArrayLength; j++) {
      tableRow
        .appendChild(document.createElement("td"))
        .appendChild(document.createTextNode(records[i][j]));
    }
  }
  body.appendChild(ourTable);
}

//Pages to the next set of data in increments of 30
function NextPage() {
  from = from + 30;
  to = to + 30;
  GetActualRecords();
}

//Pages backwards through data in increments of 30
function PreviousPage() {
  from = from - 30;
  to = to - 30;
  GetActualRecords();
}

//Removes current table to enable pagination (Called in build table function)
function RemoveTable() {
  if (document.getElementById("Table") != null) {
    $("Table").remove();
  }
}

//Activates the submit button to produce users search results
function SearchBar() {
  let userInput = <HTMLInputElement>document.getElementById("userInput");
  from = parseInt(userInput.value);
  console.log("userInput: " + from);
  to = from + 30;

  GetActualRecords();
}

//Enables mouse hover over table rows for readability
$("td").hover(
  function() {
    $(this).css("background-color", "yellow");
  },
  function() {
    $(this).css("background-color", "pink");
  }
);
