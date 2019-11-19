//Loads the table to the screen
window.onload = () => GetTotalNumberOfRecords();
//Resizes page during window resizing
window.onresize = () => Resize();

//Variable declarations
let totalRecordCount: number;
let columnNames: any[];
let records: any[];
let from: number = 0;
let to: number = 0;
let NumberOfRows = Math.floor((window.innerHeight - 50) / 24) - 1;
let timeout: any;

//Function to retrieve total amount of records
function GetTotalNumberOfRecords() {
  $.ajax({
    url: "/recordCount",
    type: "GET",
    timeout: 12000,
    dataType: "text"
  })
    .done(function(responseText: any) {
      totalRecordCount = responseText;
      console.log(totalRecordCount);
      Resize();
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
    dataType: "json"
  })
    .done((responsejson: any) => {
      columnNames = responsejson;
      GetActualRecordsAmount();
    })
    .fail(() => {
      alert("Could not display column names");
    });
}

//Function to retrieve the record data
function GetActualRecordsAmount() {
  $.ajax({
    url: "/records?from=" + from + "&to=" + to,
    timeout: 12000,
    dataType: "JSON"
  })
    .done((responseRecords: any) => {
      records = responseRecords;
      BuildTable();
    })
    .fail(() => {
      alert("No available records for your selection");
    });
}

//Function builds the table and populates with data from the API calls
function BuildTable() {
  if (document.getElementById("Table") != null) {
    $("Table").remove();
  }

  const body = document.getElementsByTagName("body")[0];

  const ourTable = document.createElement("table");
  ourTable.setAttribute("id", "Table");
  //ourTable.style.borderCollapse = "collapse";
  ourTable.style.borderSpacing = "0";

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
    tableRow.setAttribute("id", "rows");
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

//Pages to the next set of data
function NextPage() {
  let NumberOfRows = Math.floor((window.innerHeight - 50) / 24) - 1;
  if (from < from - NumberOfRows) {
    from = totalRecordCount - NumberOfRows;
    to = Math.min(from + (NumberOfRows - 1), totalRecordCount);
    console.log(from + " " + to);
    //Resize();
    GetActualRecordsAmount();
  } else {
    from = from + NumberOfRows;
    to = to + NumberOfRows;
    //Resize();
    GetActualRecordsAmount();
  }
}

//Pages backwards through data
function PreviousPage() {
  let NumberOfRows = Math.floor((window.innerHeight - 50) / 24) - 1;
  if (NumberOfRows > from) {
    from = Math.max(0, from - NumberOfRows);
    to = NumberOfRows - from;
    console.log(from);
    Resize();
    GetActualRecordsAmount();
  } else {
    from = from - NumberOfRows;
    to = from + NumberOfRows;
    Resize();
    GetActualRecordsAmount();
  }
}

//Activates the submit button to produce users search results
function SearchBar() {
  let userInput = <HTMLInputElement>document.getElementById("userInput");
  let NumberOfRows = Math.floor((window.innerHeight - 50) / 24) - 1;

  from = Math.min(parseInt(userInput.value), totalRecordCount - NumberOfRows);

  console.log("userInput: " + from);

  to = Math.min(from + NumberOfRows, totalRecordCount - 1);

  console.log("NumberOfRows:" + NumberOfRows);

  Resize();
  GetActualRecordsAmount();
}

function Resize() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    let NumberOfRows = Math.floor((window.innerHeight - 50 - 24) / 24) - 1;
    if (!from) {
      from = 0;
    } else {
      from = from;
    }
    console.log(from);

    if (NumberOfRows * (totalRecordCount - 1) > to) {
      to = Math.min(from + NumberOfRows, totalRecordCount - 1);
      from = to - NumberOfRows;
    }
    console.log(from + " " + to);
    GetColumnNames();

    if (to > from + NumberOfRows) {
      to = Math.min(from + NumberOfRows, totalRecordCount - 1);
      from = to - NumberOfRows;
    } else if (to <= from + NumberOfRows) {
      to = from + NumberOfRows;
    }

    console.log("userInput: " + from);
    GetColumnNames();
  }, 500);
}

function restrictAlphabets(e: any) {
  var x = e.which || e.keycode;
  if ((x >= 48 && x <= 57) || x == 8 || (x >= 35 && x <= 40) || x == 46)
    return true;
  else return false;
}
