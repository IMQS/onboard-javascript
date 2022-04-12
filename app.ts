// Column variables created in html that allows the other content to be added to the page.
let recordNav: any = document.querySelector("#record-navigation");
let headingColumns: any = document.querySelector("#column-headings");
let infoColumns: any = document.querySelector("#info-columns");
//

// Fetch request that gets the headings as well as the information and then runs
// the functions that create the rows and columns as well as add the info to them.
function fetchData() {
  // Fetches the heading data
  fetch("http://localhost:2050/columns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.text())
    .then((data) => {
      let headingDataList = JSON.parse(data);

      for (let i = 0; i < headingDataList.length; i++) {
        columnHeading(headingDataList[i]);
      }

      // Fetching information
      fetch("http://localhost:2050/records?from=0&to=16", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.text())
        .then((data) => {
          let columnDataList = JSON.parse(data);

          for (let i = 0; i < columnDataList.length; i++) {
            columns(columnDataList[i]);
          }
        });
    });
  createSelect();
}
fetchData();
//

// Functions that shows the info when the page loads at first.
// Function that creates the select that appears on the page as itloads.
function createSelect() {
  recordNav.innerHTML = `
  <select name="record-selection" id="record-selection">
  <option value="single">Single Record</option>
  <option value="multiple">Multiple Records</option>
  <option value="multiple-single">Multiple Single Records</option>
</select>
<button
  value="hello"
  onclick="recordSelection()"
  id="select-confirmation-btn"
>
  Confirm Selection
</button>
  `;
}
// Function that creates the columns that contain the headings of the information.
function columnHeading(heading: string) {
  let headingColumn = `<div class="column-heading">${heading}</div>`;
  headingColumns.innerHTML += headingColumn;
}
// Function that creates the columns and rows that contain the information.
function columns(info: string) {
  let infoColumns: any = document.querySelector("#info-columns");
  let infoRow = `      
    <div class="info-row">
      <div class="info-column">${info[0]}</div>
      <div class="info-column">${info[1]}</div>
      <div class="info-column">${info[2]}</div>
      <div class="info-column">${info[3]}</div>
      <div class="info-column">${info[4]}</div>
      <div class="info-column">${info[5]}</div>
      <div class="info-column">${info[6]}</div>
      <div class="info-column">${info[7]}</div>
      <div class="info-column">${info[8]}</div>
      <div class="info-column">${info[9]}</div>
      <div class="info-column">${info[10]}</div>
    </div>`;
  infoColumns.innerHTML += infoRow;
}
//

// Functions that shows the info when a user search for a single record.
// Function that shows only one heading depending on what is being searched.
function singleColumnHeading(heading: string) {
  let headingColumn = `
  <div class="column-heading">ID</div>
  <div class="column-heading">${heading}</div>
  `;
  headingColumns.innerHTML = "";
  headingColumns.innerHTML += headingColumn;
}
// Function that creates a single column and/or row
// that contain the information.
function singleColumns(info: string, contentColumn: any, heading: any) {
  let contentNumber: any;
  let headingArrayNumber: any;

  if (contentColumn === "a") {
    contentNumber = 1;
    headingArrayNumber = 1;
  } else if (contentColumn === "b") {
    contentNumber = 2;
    headingArrayNumber = 2;
  } else if (contentColumn === "c") {
    contentNumber = 3;
    headingArrayNumber = 3;
  } else if (contentColumn === "d") {
    contentNumber = 4;
    headingArrayNumber = 4;
  } else if (contentColumn === "e") {
    contentNumber = 5;
    headingArrayNumber = 5;
  } else if (contentColumn === "f") {
    contentNumber = 6;
    headingArrayNumber = 6;
  } else if (contentColumn === "g") {
    contentNumber = 7;
    headingArrayNumber = 7;
  } else if (contentColumn === "h") {
    contentNumber = 8;
    headingArrayNumber = 8;
  } else if (contentColumn === "i") {
    contentNumber = 9;
    headingArrayNumber = 9;
  } else if (contentColumn === "j") {
    contentNumber = 10;
    headingArrayNumber = 10;
  } else {
    alert("Sorry the data you have entered is incorrect. Please try again.");
  }

  let columnHead = heading[headingArrayNumber];
  singleColumnHeading(columnHead);

  let infoRow = `
  <div class="info-row">
    <div class="info-column">${info[0]}</div>
    <div class="info-column">${info[contentNumber]}</div>
  </div>`;
  infoColumns.innerHTML += infoRow;
}
//

// Function that creates the rows and highlights the data you are searching
// for in the multiple single records.
function multipleSingularColumns(
  info: string,
  columnPostion: string,
  idOfData: string
) {
  let infoColumns: any = document.querySelector("#info-columns");
  let infoRows = `      
    <div  class="info-row">
      <div class="info-column">${info[0]}</div>
      <div id="one" class="info-column certain-column${idOfData}">${info[1]}</div>
      <div id="two" class="info-column certain-column${idOfData}">${info[2]}</div>
      <div id="three" class="info-column certain-column${idOfData}">${info[3]}</div>
      <div id="four" class="info-column certain-column${idOfData}">${info[4]}</div>
      <div id="five" class="info-column certain-column${idOfData}">${info[5]}</div>
      <div id="six" class="info-column certain-column${idOfData}">${info[6]}</div>
      <div id="seven" class="info-column certain-column${idOfData}">${info[7]}</div>
      <div id="eight" class="info-column certain-column${idOfData}">${info[8]}</div>
      <div id="nine" class="info-column certain-column${idOfData}">${info[9]}</div>
      <div id="ten" class="info-column certain-column${idOfData}">${info[10]}</div>
    </div>`;

  if (columnPostion === "a") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#one.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "b") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#two.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "c") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#three.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "d") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#four.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "e") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#five.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "f") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#six.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "g") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#seven.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "h") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#eight.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "i") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#nine.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else if (columnPostion === "j") {
    infoColumns.innerHTML += infoRows;
    let infoColumnTargeted: any = document.querySelector(
      "#ten.certain-column" + idOfData
    );
    infoColumnTargeted.style.color = "red";
  } else {
    alert("Error");
  }
}
//

// Function that allows the user to filter between looking fo a singular record, multiple records or multiple singular records.
function recordSelection() {
  // let confirmationBtn: any = document.querySelector("#select-confirmation-btn") runs the function in the html (onclick);
  // Accesses the area on the page where the select is shown.
  let selectionArea: any = recordNav;
  // Checks how you want filter records.
  let recordSelector: any = document.querySelector("#record-selection");
  let recordSelectionValue: string = recordSelector.value;
  //
  let records: any = [];

  // Checks if the select gives a proper value.
  if (
    recordSelectionValue === "single" ||
    recordSelectionValue === "multiple" ||
    recordSelectionValue === "multiple-single"
  ) {
    if (recordSelectionValue === "single") {
      // Creates a div that includes all the inputs, selects and buttons needed to filter.
      let singleRecordSelection = `
      <button id="single-return-btn" class="return-btn">Return</button>
      <div id="user-input-data">
      <div class="navigation-input-area">
        <label class="record-labels" for="record-id"
          >Enter record ID :
        </label>
        <input
          type="number"
          min="0"
          name="record-id"
          id="record-id"
          class="navigation-input"
          value="bad"
        />
      </div>
      <div class="navigation-input-area">
        <label class="record-labels" for="record-id"
          >Enter record content letter (Optional) :
        </label>
      <select name="record-content" class="navigation-input" id="record-content">
        <option value="none">Select Letter</option>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
        <option value="d">D</option>
        <option value="e">E</option>
        <option value="f">F</option>
        <option value="g">G</option>
        <option value="h">H</option>
        <option value="i">I</option>
        <option value="j">J</option>
      </select>
      </div>
    </div>
    <button id="single-submit-btn" class="submit-btn" >Get Record</button>
      `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = singleRecordSelection;

      let returnBtn: any = document.querySelector(
        "#single-return-btn.return-btn"
      );
      returnBtn.addEventListener("click", () => {
        headingColumns.innerHTML = "";
        infoColumns.innerHTML = "";
        fetchData();
        createSelect();
      });

      let singleSubmitBtn: any = document.querySelector(
        "#single-submit-btn.submit-btn"
      );
      singleSubmitBtn.addEventListener("click", () => {
        let recordId: any = document.querySelector("#record-id");
        let recordIdValue = recordId.value;

        let recordContent: any = document.querySelector("#record-content");
        let recordContentValue = recordContent.value;

        if (
          (recordIdValue !== null &&
            recordContentValue === null &&
            recordIdValue !== "" &&
            recordContentValue === "") ||
          recordContentValue === "none"
        ) {
          fetch("http://localhost:2050/columns", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.text())
            .then((data) => {
              let headingDataList = JSON.parse(data);
              headingColumns.innerHTML = "";

              for (let i = 0; i < headingDataList.length; i++) {
                columnHeading(headingDataList[i]);
              }
              // Fetching information
              fetch(
                "http://localhost:2050/records?from=" +
                  recordIdValue +
                  "&to=" +
                  recordIdValue,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                }
              )
                .then((response) => response.text())
                .then((data) => {
                  let columnDataList = JSON.parse(data);

                  for (let i = 0; i < columnDataList.length; i++) {
                    let infoColumns: any =
                      document.querySelector("#info-columns");
                    infoColumns.innerHTML = "";
                    columns(columnDataList[i]);
                  }
                });
            });
        } else if (
          recordIdValue !== null ||
          (recordContentValue !== null && recordIdValue !== "") ||
          recordContentValue !== "" ||
          recordContentValue !== "none"
        ) {
          // Fetching headings
          let headingsList: any = [];
          fetch("http://localhost:2050/columns", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.text())
            .then((data) => {
              let headingDataList = JSON.parse(data);

              for (let i = 0; i < headingDataList.length; i++) {
                headingsList.push(headingDataList[i]);
              }
              // Fetching information
              fetch(
                "http://localhost:2050/records?from=" +
                  recordIdValue +
                  "&to=" +
                  recordIdValue,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                }
              )
                .then((response) => response.text())
                .then((data) => {
                  let columnDataList = JSON.parse(data);

                  for (let i = 0; i < columnDataList.length; i++) {
                    let infoColumns: any =
                      document.querySelector("#info-columns");

                    infoColumns.innerHTML = "";

                    singleColumns(
                      columnDataList[i],
                      recordContentValue,
                      headingsList
                    );
                  }
                });
            });
        } else {
          alert("Sorry there has been a problem. Can you please try again.");
          let confirmation = confirm("Try again?");
          if (confirmation === true) {
            recordIdValue.value = "";
            recordContentValue.value = "";
          } else {
            window.location.reload();
          }
        }
      });
    } else if (recordSelectionValue === "multiple") {
      let multipleRecordSelection = `
      <button id="multiple-return-btn" class="return-btn">Return</button>
      <div id="user-input-data">
      <div class="navigation-input-area">
        <div class="navigation-input-area-id" id="from-id">
          <label class="record-labels" for="record-id"
            >Enter starting record ID :
          </label>
          <input
            type="number"
            min="0"
            name="record-id"
            id="from-record-id"
            class="navigation-input"
          />
        </div>
        <div class="navigation-input-area-id" id="from-id">
          <label class="record-labels" for="record-id"
            >Enter stop record ID :
          </label>
          <input
            type="number"
            min="0"
            name="record-id"
            id="to-record-id"
            class="navigation-input"
          />
        </div>
      </div>
    </div>
    <button id="multiple-submit-btn" class="submit-btn" >Get Records</button>
      `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = multipleRecordSelection;

      let returnBtn: any = document.querySelector(
        "#multiple-return-btn.return-btn"
      );
      returnBtn.addEventListener("click", () => {
        records = [];
        headingColumns.innerHTML = "";
        infoColumns.innerHTML = "";
        fetchData();
        createSelect();
        createSelect();
      });
      let multipleSubmitBtn: any = document.querySelector(
        "#multiple-submit-btn.submit-btn"
      );
      multipleSubmitBtn.addEventListener("click", () => {
        let fromIdSelection: any = document.querySelector(
          "#from-record-id.navigation-input"
        );
        let toIdSelection: any = document.querySelector(
          "#to-record-id.navigation-input"
        );

        let fromIdValue = fromIdSelection.value;
        let toIdValue = toIdSelection.value;

        if (
          (fromIdValue !== null && toIdValue !== null) ||
          (fromIdValue !== "" && toIdValue !== "")
        ) {
          const totalRecordsAllowed = 16;
          let recordCount: number = Number(toIdValue) - Number(fromIdValue) + 1;
          if (
            recordCount > totalRecordsAllowed ||
            typeof recordCount !== "number"
          ) {
            let excessRecords = recordCount - totalRecordsAllowed;
            toIdValue = toIdValue - excessRecords;
            alert(
              "The data you entered is incorrect or you trying to access to much records only " +
                totalRecordsAllowed +
                " records can be accessed at a time. You have " +
                excessRecords +
                " excess records"
            );
            // Fetching information
            fetch(
              "http://localhost:2050/records?from=" +
                fromIdValue +
                "&to=" +
                toIdValue,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            )
              .then((response) => response.text())
              .then((data) => {
                let columnDataList = JSON.parse(data);

                infoColumns.innerHTML = "";
                for (let i = 0; i < columnDataList.length; i++) {
                  columns(columnDataList[i]);
                }
              });
          } else if (recordCount <= 16 || typeof recordCount === "number") {
            // Fetching information
            fetch(
              "http://localhost:2050/records?from=" +
                fromIdValue +
                "&to=" +
                toIdValue,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            )
              .then((response) => response.text())
              .then((data) => {
                let columnDataList = JSON.parse(data);

                infoColumns.innerHTML = "";
                for (let i = 0; i < columnDataList.length; i++) {
                  columns(columnDataList[i]);
                }
              });
          }
        } else {
          alert(
            "Sorry there has been a problem. Please check your inputs make sure you have both filled."
          );
        }
      });
    } else if (recordSelectionValue === "multiple-single") {
      let multipleSingleRecordSelection = `
      <button id="multiple-single-return-btn" class="return-btn">Return</button>
      <div id="user-input-data">
        <div class="navigation-input-area">
          <div class="navigation-input-area-id" id="id">
            <label class="record-labels" for="record-id"
              >Enter record ID :
            </label>
            <input
              type="number"
              min="0"
              name="record-id"
              id="record-id"
              class="navigation-input"
            />
          </div>
          <div id="multiple-single-selection" class="navigation-input-area-id">
            <label class="record-labels" for="record-id"
              >Enter record content letter (Optional) :
            </label>
            <select
              name="record-content"
              class="navigation-input"
              id="record-content"
            >
              <option value="none">Select Letter</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
              <option value="e">E</option>
              <option value="f">F</option>
              <option value="g">G</option>
              <option value="h">H</option>
              <option value="i">I</option>
              <option value="j">J</option>
            </select>
          </div>
        </div>
      </div>
      <button id="add-records-btn" class="add-btn">See Records</button>
      `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = multipleSingleRecordSelection;
      let returnBtn: any = document.querySelector(
        "#multiple-single-return-btn.return-btn"
      );
      returnBtn.addEventListener("click", () => {
        alert("Records you have viewed " + records);
        headingColumns.innerHTML = "";
        infoColumns.innerHTML = "";
        fetchData();
        createSelect();
        createSelect();
      });
      let addMulitpleSingularRecords: any = document.querySelector(
        "#add-records-btn.add-btn"
      );

      addMulitpleSingularRecords.addEventListener("click", () => {
        // Inputs and selects
        let IdSelection: any = document.querySelector(
          "#record-id.navigation-input"
        );

        let letterValueSelection: any =
          document.querySelector("#record-content");

        //Values Needed
        let IdValue = IdSelection.value;
        let letterValue = letterValueSelection.value;
        let numberCheck: number = 12 - Number(IdValue);
        const recordAmount: number = 16;
        let amountOfRecords = records.length;

        if (amountOfRecords > recordAmount) {
          alert("That is the total amount of records that can be added");
        } else if (amountOfRecords === 0) {
          infoColumns.innerHTML = "";
        } else {
          //pass
        }

        if (
          typeof numberCheck === "number" &&
          typeof letterValue === "string"
        ) {
          let record = {
            Id: IdValue,
            letterId: letterValue,
          };
          let arrayRecord = JSON.stringify(record);
          let isInArray = records.includes(arrayRecord);

          if (isInArray === false) {
            // Fetching information
            fetch(
              "http://localhost:2050/records?from=" +
                IdValue +
                "&to=" +
                IdValue,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            )
              .then((response) => response.text())
              .then((data) => {
                let columnDataList = JSON.parse(data);

                infoColumns.innerHTML += "";
                for (let i = 0; i < columnDataList.length; i++) {
                  multipleSingularColumns(
                    columnDataList[i],
                    letterValue,
                    IdValue
                  );
                }
              });
            records.push(arrayRecord);

            for (let i = 0; i < records.length; i++) {
              JSON.parse(records[i]);
            }
          } else {
            alert("The record was already added");
          }
        } else {
          alert("Enter apropriate inputs please");
        }
      });
      records = records;
    } else {
      alert(
        "Sorry there has been a problem. The page will reload can you please try again."
      );
      window.location.reload();
    }
  } else {
    alert(
      "Sorry there has been a problem. The page will reload can you please try again."
    );
    window.location.reload();
  }
}
//
