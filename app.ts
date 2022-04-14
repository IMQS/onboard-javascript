// Get the container from the html where the data will be stored
let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;

function createNavigation() {
  recordNav.innerHTML = `
  <div class="next-previous-navigation">
  <div class="next-previous-navigation-btns">
    <button class="previous-records-btn">Previous</button>
    <button class="next-records-btn">Next</button>
    <button class="reset-records-btn">First Page</button>
    <button class="last-records-btn">Last Page</button>
  </div>
</div>
<div class="current-page-container">
<p class=current-page></p>
</div>
<div class="select-confirm">
  <select name="record-selection" id="record-selection">
    <option value="multiple">Multiple Records</option>
    <option value="single">Single Records</option>
  </select>
  <button onclick="recordSelection()" id="confirmation-btn">
    Confirm Selection
  </button>
</div>
  `;
}

function createHeadingGrid(headings: any) {
  let headingsData: any = `<h1 class="column-heading">${headings}</h1>`;
  headingColumns.innerHTML += headingsData;
}

function createGrid(columnData: string) {
  let infoRowColumns: any = `
    <div class="info-data-row">
    <p class="info-column">${columnData[0]}</p>
    <p class="info-column">${columnData[1]}</p>
    <p class="info-column">${columnData[2]}</p>
    <p class="info-column">${columnData[3]}</p>
    <p class="info-column">${columnData[4]}</p>
    <p class="info-column">${columnData[5]}</p>
    <p class="info-column">${columnData[6]}</p>
    <p class="info-column">${columnData[7]}</p>
    <p class="info-column">${columnData[8]}</p>
    <p class="info-column">${columnData[9]}</p>
    <p class="info-column">${columnData[10]}</p>
  </div>`;
  infoColumns.innerHTML += infoRowColumns;
}

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
            createGrid(columnDataList[i]);
          }
        });
    });

  createNavigation();
}

fetchData();

function nextPageData(firstNumber: any, secondNumber: any) {
  // Fetching information
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
        createGrid(columnDataList[i]);
      }
    });
}

function nextPrevious(firstId: any, finalId: any) {
  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");
  let resetBtn: any = document.querySelector(".reset-records-btn");
  let lastPageBtn: any = document.querySelector(".last-records-btn");
  let currentPage: any = document.querySelector(".current-page");

  let numberOne: number = firstId;
  let numberTwo: number = finalId;
  const amountRecords: number = 15;

  currentPage.innerHTML = numberOne + " -> " + numberTwo + " First Page";

  if (numberOne === 0 && numberTwo === 14) {
    previousBtn.disabled = true;
  } else {
    //pass
  }

  resetBtn.addEventListener("click", () => {
    let nextNumberOne: number = 0;
    let nextNumberTwo: number = 14;
    previousBtn.disabled = true;
    nextBtn.disabled = false;

    currentPage.innerHTML = "";
    currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
    numberOne = nextNumberOne;
    numberTwo = nextNumberTwo;
    nextPageData(numberOne, numberTwo);
  });

  lastPageBtn.addEventListener("click", () => {
    let nextNumberOne: number = 999985;
    let nextNumberTwo: number = 999999;
    nextBtn.disabled = true;
    previousBtn.disabled = false;

    currentPage.innerHTML = "";
    currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
    numberOne = nextNumberOne;
    numberTwo = nextNumberTwo;
    nextPageData(numberOne, numberTwo);
  });

  nextBtn.addEventListener("click", () => {
    let nextNumberOne: number = numberOne + amountRecords;
    let nextNumberTwo: number = numberTwo + amountRecords;
    previousBtn.disabled = false;

    if (nextNumberOne === 999985 && nextNumberTwo === 999999) {
      currentPage.innerHTML = "";
      currentPage.innerHTML =
        nextNumberOne + " -> " + nextNumberTwo + " Final Page";
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
      nextBtn.disabled = true;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
    }
  });

  previousBtn.addEventListener("click", () => {
    let nextNumberOne: number = numberOne - amountRecords;
    let nextNumberTwo: number = numberTwo - amountRecords;
    nextBtn.disabled = false;

    if (nextNumberOne === 0 && nextNumberTwo === 14) {
      currentPage.innerHTML = "";
      currentPage.innerHTML =
        nextNumberOne + " -> " + nextNumberTwo + " First Page";
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
      previousBtn.disabled = true;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
      nextPageData(numberOne, numberTwo);
    }
  });
}
function recordSelection() {
  let selectionArea: any = recordNav;
  let recordSelector: any = document.querySelector("#record-selection");
  let recordSelectionValue: string = recordSelector.value;
  let records: any = [];

  if (
    recordSelectionValue === "multiple" ||
    recordSelectionValue === "single"
  ) {
    if (recordSelectionValue === "multiple") {
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
              value="0"
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
              value="15"
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
        createNavigation();
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

        if (fromIdValue.length === 0 || toIdValue === 0) {
          alert(
            "You left one of the record id inputs empty or you have entered an incorrect character."
          );
        } else {
          if (
            (fromIdValue !== null && toIdValue !== null) ||
            (fromIdValue !== "" && toIdValue !== "")
          ) {
            const totalRecordsAllowed = 16;
            let recordCount: number =
              Number(toIdValue) - Number(fromIdValue) + 1;
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
                  for (let i = 0; i < columnDataList.length; i++) {}
                });
            }
          } else {
            alert(
              "Sorry there has been a problem. Please check your inputs make sure you have both filled."
            );
          }
        }
      });
    } else if (recordSelectionValue === "single") {
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
              value="0"
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
        createNavigation();
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

        if (IdValue.length === 0 || letterValue === "none") {
          alert(
            "You left one of the record id inputs empty or you have entered an incorrect character."
          );
        } else {
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
                  console.log(columnDataList);
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
    alert("Error");
  }
}
