// Get the container from the html where the data will be stored
let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;

// Creates the navigation.
function createNavigation() {
  recordNav.innerHTML = `
  <div class="next-previous-navigation-btns">
    <button class="previous-records-btn">Previous</button>
    <button class="next-records-btn">Next</button>
    <button class="reset-records-btn">First Page</button>
    <button class="last-records-btn">Last Page</button>
  </div>
  <div class="select-confirm">
  <select name="record-selection" id="record-selection">
  <option value="single">Single Records</option>
    <option value="multiple">Multiple Records</option>
  </select>
  <button onclick="recordSelection()" id="confirmation-btn">
    Confirm Selection
  </button>
  </div>
  <div class="current-page-container">
    <p class=current-page></p>
  </div>

  `;
}

// Heading and info grid being created.
function createHeadingGrid(headings: any) {
  let headingsData: any = `<h1 class="column-heading">${headings}</h1>`;
  headingColumns.innerHTML += headingsData;
}

function dynamicGrid(columnData: any) {
  // Creates the row that the info will display and adds it to the infoColumnsArea.
  let infoDataRow = `<div id="info-row-${columnData[0]}" class="info-rows"></div>`;
  infoColumns.innerHTML += infoDataRow;
  // Gets the created rows.
  let finalInfoDataRow: any = document.querySelector(
    "#info-row-" + columnData[0] + ".info-rows"
  );

  // Loops through
  for (let x = 0; x < columnData.length; x++) {
    let Div = `<p class="info-row-data">${columnData[x]}</p>`;
    finalInfoDataRow.innerHTML += Div;
  }
}

// Adds data in the heading and info grid.
function fetchData() {
  // Gets headings array
  fetch("http://localhost:2050/columns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.text())
    .then((data) => {
      let headingDataList = JSON.parse(data);
      let headings: string;

      for (let i = 0; i < headingDataList.length; i++) {
        headings = headingDataList[i];
        createHeadingGrid(headings);
      }

      let fromNumber = 0;
      let toNumber = 14;

      nextPrevious(fromNumber, toNumber);

      // Fetching information
      fetch(
        "http://localhost:2050/records?from=" + fromNumber + "&to=" + toNumber,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.text())
        .then((data) => {
          let columnDataList = JSON.parse(data);
          for (let i = 0; i < columnDataList.length; i++) {
            // createGrid(columnDataList[i]);
            dynamicGrid(columnDataList[i]);
          }
        });
    });

  createNavigation();
}

fetchData();

// The functionality to move through an amount of records.
function nextPrevious(firstId: any, finalId: any) {
  // Btn's used to move from page to page.
  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");

  // Btn's used to move directly to the last and first page.
  let firstPageBtn: any = document.querySelector(".reset-records-btn");
  let lastPageBtn: any = document.querySelector(".last-records-btn");

  // The area where the current page is shown.
  let currentPage: any = document.querySelector(".current-page");

  // The id's of the records that represent the first and last record of the page.
  let numberOne: number = firstId;
  let numberTwo: number = finalId;
  const amountRecords: number = 15;

  // Dsplays the current page.
  currentPage.innerHTML = numberOne + " / " + numberTwo + " First Page";

  if (numberOne === 0 && numberTwo === 14) {
    previousBtn.disabled = true;
  } else {
    //pass
  }

  // The button that takes you to the first page.
  firstPageBtn.addEventListener("click", () => {
    let nextNumberOne: number = 0;
    let nextNumberTwo: number = 14;
    previousBtn.disabled = true;
    nextBtn.disabled = false;

    currentPage.innerHTML = "";
    currentPage.innerHTML =
      nextNumberOne + " / " + nextNumberTwo + " First Page";
    numberOne = nextNumberOne;
    numberTwo = nextNumberTwo;
    nextPageData(numberOne, numberTwo);
  });

  // The button that takes you to the last page.
  lastPageBtn.addEventListener("click", () => {
    let nextNumberOne: number = 999985;
    let nextNumberTwo: number = 999999;
    nextBtn.disabled = true;
    previousBtn.disabled = false;

    currentPage.innerHTML = "";
    currentPage.innerHTML =
      nextNumberOne + " / " + nextNumberTwo + " Last Page";
    numberOne = nextNumberOne;
    numberTwo = nextNumberTwo;
    nextPageData(numberOne, numberTwo);
  });

  // The button that takes you to the next page.
  nextBtn.addEventListener("click", () => {
    let nextNumberOne: number = numberOne + amountRecords;
    let nextNumberTwo: number = numberTwo + amountRecords;
    previousBtn.disabled = false;

    if (nextNumberOne === 999985 && nextNumberTwo === 999999) {
      currentPage.innerHTML = "";
      currentPage.innerHTML =
        nextNumberOne + " / " + nextNumberTwo + " Final Page";
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
      nextBtn.disabled = true;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " / " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
    }
  });

  // The button that takes you to the previous page.
  previousBtn.addEventListener("click", () => {
    let nextNumberOne: number = numberOne - amountRecords;
    let nextNumberTwo: number = numberTwo - amountRecords;
    nextBtn.disabled = false;

    if (nextNumberOne === 0 && nextNumberTwo === 14) {
      currentPage.innerHTML = "";
      currentPage.innerHTML =
        nextNumberOne + " / " + nextNumberTwo + " First Page";
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
      previousBtn.disabled = true;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " / " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
    }
  });
}

function nextPageData(firstNumber: any, secondNumber: any) {
  // Fetching information that will display when you go to the next or previous page.
  fetch(
    "http://localhost:2050/records?from=" + firstNumber + "&to=" + secondNumber,
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
        dynamicGrid(columnDataList[i]);
      }
    });
}

// Checks if you looking for a single or multiple records.
function recordSelection() {
  let selectionArea: any = recordNav;
  let recordSelector: any = document.querySelector("#record-selection");
  let recordSelectionValue: string = recordSelector.value;
  let records: any = [];

  if (
    recordSelectionValue === "multiple" ||
    recordSelectionValue === "single"
  ) {
    if (recordSelectionValue === "single") {
      let multipleSingleRecordSelection = `
    <button id="return-btn">Return</button>
      <div id="user-input-data">
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
            value="0"
          />
        </div>
      </div>
    <button id="get-record-btn">See Record</button>
    `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = multipleSingleRecordSelection;

      let returnBtn: any = document.querySelector("#return-btn");

      returnBtn.addEventListener("click", () => {
        let recordsViewed: any;
        let viewedRecords: any = [];
        for (let i = 0; i < records.length; i++) {
          recordsViewed = JSON.parse(records[i])["ID"];
          viewedRecords.push(recordsViewed);
        }
        alert("Records you have viewed " + viewedRecords);
        headingColumns.innerHTML = "";
        infoColumns.innerHTML = "";
        fetchData();
        createNavigation();
      });

      let getSingleRecord: any = document.querySelector("#get-record-btn");

      getSingleRecord.addEventListener("click", () => {
        infoColumns.innerHTML = "";
        // Id input
        let IdSelection: any = document.querySelector("#record-id");

        //Values Needed
        let IdValue = IdSelection.value;
        let numberCheck: number = 12 - Number(IdValue);

        // Value checks
        if (IdValue.length === 0) {
          alert("You have entered an incorrect character.");
        } else {
          if (IdValue > 999999) {
            alert("The record you are looking for does not exist");
            IdValue = 0;
          } else {
            //pass
          }

          if (typeof numberCheck === "number") {
            let record = {
              ID: IdValue,
            };

            let arrayRecord = JSON.stringify(record);
            let isInArray = records.includes(arrayRecord);
            let finalSingleId: number;
            let properId: any;

            if (IdValue > 999984) {
              properId = IdValue;
              finalSingleId = 999999;
              IdValue = 999984;
            } else {
              finalSingleId = Number(IdValue) + 15;
            }

            if (isInArray === false || isInArray === true) {
              if (isInArray === true) {
                let removeIndex = records.indexOf(record["ID"]);
                records.splice(removeIndex);
              } else {
                //pass
              }

              // Fetching information
              fetch(
                "http://localhost:2050/records?from=" +
                  IdValue +
                  "&to=" +
                  finalSingleId,
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
                    if (IdValue == 999984) {
                      IdValue = properId;
                      console.log(properId);
                    } else {
                      //pass
                    }
                    createGridSingle(columnDataList[i], IdValue);
                  }
                });

              records.push(arrayRecord);

              for (let i = 0; i < records.length; i++) {
                JSON.parse(records[i]);
              }
            } else {
              alert("There is a problem accessing the record.");
            }
          } else {
            alert("Enter apropriate inputs please.");
          }
        }
      });

      records = records;
    } else if (recordSelectionValue === "multiple") {
      let multipleRecordSelection = `
      <button id="return-btn">Return</button>
      <div id="user-input-data">
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
              value="0"
            />
            <input
            type="number"
            readonly
            disabled
            min="0"
            name="record-id"
            id="to-record-id"
            class="navigation-input"
          />
          </div>
      </div>
      <button id="submit-btn">Get Records</button>
      `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = multipleRecordSelection;

      let returnBtn: any = document.querySelector("#return-btn");
      returnBtn.addEventListener("click", () => {
        records = [];
        headingColumns.innerHTML = "";
        infoColumns.innerHTML = "";
        fetchData();
        createNavigation();
      });

      let SubmitBtn: any = document.querySelector("#submit-btn");
      SubmitBtn.addEventListener("click", () => {
        let fromIdSelection: any = document.querySelector(
          "#from-record-id.navigation-input"
        );
        let toIdSelection: any = document.querySelector(
          "#to-record-id.navigation-input"
        );

        let fromIdValue = fromIdSelection.value;

        if (fromIdValue > 999984 && fromIdValue <= 999999) {
          fromIdValue = 999984;
          alert("You have reached the final page");
        } else {
          //pass
        }

        const totalRecordsAllowed = 15;

        let toIdSelectionValue = (toIdSelection.value =
          Number(fromIdValue) + 15);
        let toIdValue = toIdSelectionValue;

        let recordCount: number = Number(toIdValue) - Number(fromIdValue);

        if (recordCount !== 15 || fromIdValue > 999999) {
          fromIdSelection.value = "0";
          toIdSelection.value = "14";
          alert("Your entered ID is not correct or does not exist");
        } else {
          if (totalRecordsAllowed === recordCount && fromIdValue <= 999999) {
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
                  dynamicGrid(columnDataList[i]);
                }
              });
          } else {
            alert("Sorry there has been a problem. Please check your inputs.");
          }
        }
      });
    } else {
      alert("Sorry there has been a problem.");
      window.location.reload();
    }
  } else {
    alert("Something went wrong.");
  }
}

// Highlights the record you are searching for.
function createGridSingle(columnData: string, highlightedRecord: any) {
  // Creates the row that the info will display and adds it to the infoColumnsArea.
  let infoDataRow = `<div id="info-row-${columnData[0]}" class="info-rows"></div>`;
  infoColumns.innerHTML += infoDataRow;

  // Gets the created rows.
  let finalInfoDataRow: any = document.querySelector(
    "#info-row-" + columnData[0] + ".info-rows"
  );

  // Loops through the data.
  for (let x = 0; x < columnData.length; x++) {
    let Div = `<p class="info-row-data">${columnData[x]}</p>`;
    finalInfoDataRow.innerHTML += Div;
  }
  if (highlightedRecord == columnData[0]) {
    finalInfoDataRow.style.color = "red";
  } else {
    //pass
  }
}
