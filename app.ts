// Get the container from the html where the data will be stored
let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;
let debounce = (func: any, delay: any) => {
  let timer: any;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func();
    }, delay);
  };
};

// Creates the navigation.
function createNavigation() {
  recordNav.innerHTML = `
  <div class="next-previous-navigation-btns">
    <button class="previous-records-btn">Previous</button>
    <button class="next-records-btn">Next</button>
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
    let infoData = `<p class="info-row-data">${columnData[x]}</p>`;
    finalInfoDataRow.innerHTML += infoData;
  }
}

function screenSizeCheck() {
  let fromNumber: any;
  let toNumber: any;
  let recordDiff: any;

  if (typeof fromNumber && typeof toNumber === "undefined") {
    fromNumber = 0;
  } else if (typeof fromNumber === "number" && fromNumber !== 0) {
    console.log(fromNumber);
    //pass
  }

  let resizeScreen = () => {
    if (window.innerHeight > 500) {
      recordDiff = 14;
    } else if (window.innerHeight <= 500) {
      recordDiff = 10;
    }

    toNumber = fromNumber + recordDiff;

    fetchDataScreenSize(fromNumber, toNumber);
  };

  resizeScreen = debounce(resizeScreen, 500);
  window.addEventListener("resize", resizeScreen);
  resizeScreen();
  nextPrevious(fromNumber);
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
      screenSizeCheck();
    });
  createNavigation();
}

// Adds data in the heading and info grid on a smaller screen.
function fetchDataScreenSize(fromNumber: any, toNumber: any) {
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
      infoColumns.innerHTML = "";
      for (let i = 0; i < columnDataList.length; i++) {
        dynamicGrid(columnDataList[i]);
      }
    });
}

fetchData();

// The functionality to move through an amount of records.
function nextPrevious(firstId: any) {
  let navigation = document.querySelector(".next-previous-navigation-btns");

  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");

  let currentPage: any = document.querySelector(".current-page");
  let finalId: any;

  if (recordNav.contains(navigation) === true) {
    let resizeScreen = () => {
      if (window.innerHeight > 500) {
        finalId = firstId + 14;
      } else if (window.innerHeight <= 500) {
        finalId = firstId + 10;
      }

      currentPage.innerHTML =
        firstId +
        " / " +
        finalId +
        " " +
        (finalId - firstId) +
        " records only.";

      console.log(firstId, finalId);

      fetchDataScreenSize(firstId, finalId);
    };

    resizeScreen();

    if (firstId === 0) {
      previousBtn.disabled = true;
      nextBtn.disabled = false;
    } else if (firstId === 999985 || 999989) {
      nextBtn.disabled = true;
      previousBtn.disabled = false;
    }

    nextBtn.addEventListener("click", () => {
      previousBtn.disabled = false;
      firstId = firstId + (finalId - firstId);
      finalId = finalId + (finalId - firstId);

      resizeScreen = debounce(resizeScreen, 500);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    });

    previousBtn.addEventListener("click", () => {
      nextBtn.disabled = false;
      firstId = firstId + (finalId - firstId);
      finalId = finalId + (finalId - firstId);

      resizeScreen = debounce(resizeScreen, 500);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    });
  } else {
    //pass
  }
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
      let SingleRecordSelection = `
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
        <p class="amount-of-records"></p>
      </div>
    <button id="add-record-btn">Add Record</button>
    <button id="clear-record-btn">Clear Records</button>
    <button id="get-record-btn">See Record</button>
    `;
      selectionArea.innerHTML = "";
      selectionArea.innerHTML = SingleRecordSelection;

      let returnBtn: any = document.querySelector("#return-btn");

      returnBtn.addEventListener("click", () => {
        let recordsViewed: any;
        let viewedRecords: any = [];
        for (let i = 0; i < records.length; i++) {
          recordsViewed = JSON.parse(records[i])["ID"];
          viewedRecords.push(recordsViewed);
        }
        if (viewedRecords.length === 0) {
          headingColumns.innerHTML = "";
          infoColumns.innerHTML = "";
          fetchData();
          createNavigation();
        } else {
          alert("Records you have viewed " + viewedRecords);
          headingColumns.innerHTML = "";
          infoColumns.innerHTML = "";
          fetchData();
          createNavigation();
        }
      });

      let clearBtn: any = document.querySelector("#clear-record-btn");
      let amountOfRecords: any = document.querySelector(".amount-of-records");
      let addRecord: any = document.querySelector("#add-record-btn");
      let getSingleRecord: any = document.querySelector("#get-record-btn");

      if (records.length === 0) {
        getSingleRecord.disabled = true;
        clearBtn.disabled = true;
      } else {
      }

      addRecord.addEventListener("click", () => {
        clearBtn.disabled = false;
        let IdSelection: any = document.querySelector("#record-id");
        let IdValue = IdSelection.value;
        let numberCheck: number = 12 - Number(IdValue);

        if (IdValue > 999999) {
          alert("The record you are looking for does not exist");
          IdValue = 0;
        } else {
          //pass
        }

        if (IdValue.length === 0 || IdValue < 0) {
          alert("You have entered an incorrect character.");
          IdValue = 0;
        }

        if (typeof numberCheck === "number") {
          addRecord.disabled = false;
          IdSelection.readonly = false;
          let recordAmount: any;

          if (window.innerHeight > 500) {
            recordAmount = 15;
          } else {
            recordAmount = 11;
          }

          clearBtn.addEventListener("click", () => {
            if (records.length === 0) {
              clearBtn.disabled = true;
            } else {
              addRecord.disabled = false;
              clearBtn.disabled = true;
              getSingleRecord.disabled = true;
              records = [];
              amountOfRecords.innerHTML = records.length + " / " + recordAmount;
              alert("Records been cleared");
            }
          });

          let record = {
            ID: IdValue,
          };

          let arrayRecord = JSON.stringify(record);
          let isInArray = records.includes(arrayRecord);

          if (isInArray === false || isInArray === true) {
            if (isInArray === true) {
              let removeIndex = records.indexOf(record["ID"]);
              records.splice(removeIndex);
            } else {
              //pass
            }

            if (records.length === recordAmount) {
              addRecord.disabled = true;
              IdSelection.readonly = true;
              getSingleRecord.disabled = false;
              alert(
                "Thats the maximun. To view your records click see record button."
              );
            } else {
              records.push(arrayRecord);
            }

            for (let i = 0; i < records.length; i++) {
              JSON.parse(records[i]);
            }

            records = records;
            amountOfRecords.innerHTML = records.length + " / " + recordAmount;
          } else {
            alert("Enter apropriate inputs please.");
          }
        }
      });

      getSingleRecord.addEventListener("click", () => {
        infoColumns.innerHTML = "";

        let recordIdValue: any;
        let lastRecord: any;

        for (let i = 0; i < records.length; i++) {
          recordIdValue = Number(JSON.parse(records[i])["ID"]);
          lastRecord = Number(JSON.parse(records[records.length - 1])["ID"]);

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
              infoColumns.innerHTML += "";
              for (let x = 0; x < columnDataList.length; x++) {
                dynamicGrid(columnDataList[x]);
              }
            });
        }
        console.log(lastRecord);
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

        let totalRecordsAllowed: any;

        let toIdSelectionValue = (toIdSelection.value =
          Number(fromIdValue) + totalRecordsAllowed);
        let toIdValue = toIdSelectionValue;

        let recordCount: number = Number(toIdValue) - Number(fromIdValue);

        if (
          recordCount !== totalRecordsAllowed ||
          fromIdValue > 999999 ||
          fromIdSelection < 0
        ) {
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
