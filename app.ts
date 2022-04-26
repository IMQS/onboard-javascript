// Get the container from the html where the data will be stored
let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;
let count = 1;
let debounce = (func: any, delay: any) => {
  let timer: any;
  return function () {
    clearTimeout(timer);
    count++;

    timer = setTimeout(() => {
      func();
      count = 1;
    }, delay);
  };
};

// Creates the navigation.
function createNavigation() {
  recordNav.innerHTML = `
  <div class="navigation-btns">
    <button class="first-page-btn">First Page</button>  
    <button class="previous-records-btn">Previous</button>
    <button class="next-records-btn">Next</button>
    <button class="last-page-btn">Last Page</button>  
    <button onclick="recordSelection()" id="confirmation-btn">Get Record</button>
  </div>
  <div class="current-page-container">
    <p class=current-page></p>
  </div>

  `;
}

// The functionality to move through an amount of records.
function nextPrevious(firstId: any) {
  let navigation = document.querySelector(".navigation-btns");

  let firstPage: any = document.querySelector(".first-page-btn");
  let lastPage: any = document.querySelector(".last-page-btn");
  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");

  let currentPage: any = document.querySelector(".current-page");
  let finalId: any;

  if (recordNav.contains(navigation) === true) {
    let resizeScreen = () => {
      let amountRecord: any;

      if (finalId >= 999999) {
        if (window.innerHeight > 500) {
          finalId = 999999;
          firstId = finalId - 14;
        } else if (window.innerHeight <= 500 && window.innerHeight > 350) {
          finalId = 999999;
          firstId = finalId - 10;
        } else if (window.innerHeight <= 350 && window.innerHeight > 170) {
          finalId = 999999;
          firstId = finalId - 2;
        } else if (window.innerHeight <= 170) {
          finalId = 999999;
          firstId = finalId - 1;
        } else {
          //pass
        }
      } else {
        if (window.innerHeight > 500) {
          amountRecord = 14;
          finalId = firstId + amountRecord;
        } else if (window.innerHeight <= 500 && window.innerHeight > 350) {
          amountRecord = 10;
          finalId = firstId + amountRecord;
        } else if (window.innerHeight <= 350 && window.innerHeight > 170) {
          amountRecord = 2;
          finalId = firstId + amountRecord;
        } else if (window.innerHeight <= 170) {
          amountRecord = 1;
          finalId = firstId + amountRecord;
        } else {
          //pass
        }
      }

      if (firstId === 0) {
        previousBtn.disabled = true;
        nextBtn.disabled = false;
      } else if (finalId === 999999) {
        nextBtn.disabled = true;
        previousBtn.disabled = false;
      } else {
        //pass
      }

      // To change the id so that the page does not cause an error
      if (finalId > 999999 === true) {
        let recordAmount = finalId - firstId;
        nextBtn.disabled = true;
        finalId = 999999;
        firstId = finalId - recordAmount;

        currentPage.innerHTML =
          firstId +
          " / " +
          finalId +
          " " +
          (finalId - firstId + 1) +
          " records only.";

        console.log(typeof firstId, typeof finalId);

        fetchDataScreenSize(firstId, finalId);
      } else {
        firstId = firstId;
        finalId = finalId;

        console.log(firstId, finalId);

        currentPage.innerHTML =
          firstId +
          " / " +
          finalId +
          " " +
          (finalId - firstId + 1) +
          " records only.";

        fetchDataScreenSize(firstId, finalId);
      }
    };

    resizeScreen = debounce(resizeScreen, 700);
    window.addEventListener("resize", resizeScreen);
    resizeScreen();

    firstPage.addEventListener("click", () => {
      previousBtn.disabled = true;
      nextBtn.disabled = false;
      firstId = 0;
      finalId = finalId + (finalId - firstId);

      resizeScreen = debounce(resizeScreen, 700);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    });

    lastPage.addEventListener("click", () => {
      previousBtn.disabled = false;
      nextBtn.disabled = true;

      finalId = 999999;

      if (window.innerHeight > 500) {
        firstId = finalId - 14;
      } else if (window.innerHeight <= 500 && window.innerHeight > 350) {
        firstId = finalId - 10;
      } else if (window.innerHeight <= 350 && window.innerHeight > 170) {
        firstId = finalId - 2;
      } else if (window.innerHeight <= 170) {
        firstId = finalId - 1;
      } else {
        //pass
      }

      resizeScreen = debounce(resizeScreen, 700);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    });

    nextBtn.addEventListener("click", () => {
      previousBtn.disabled = false;

      let amount = finalId - firstId;

      firstId = firstId + amount;
      finalId = finalId + amount * count;

      resizeScreen = debounce(resizeScreen, 700);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
      count = 1;
    });

    previousBtn.addEventListener("click", () => {
      nextBtn.disabled = false;
      firstId = firstId - (finalId - firstId);
      finalId = finalId - (finalId - firstId);

      if (firstId < 0) {
        firstId = 0;
        previousBtn.disabled = true;
      } else {
        //pass
      }

      if (finalId === 0) {
        previousBtn.disabled = true;
      } else {
        //pass
      }

      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    });
  }
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
    } else if (window.innerHeight <= 500 && window.innerHeight > 350) {
      recordDiff = 10;
    } else if (window.innerHeight <= 350 && window.innerHeight > 170) {
      recordDiff = 2;
    } else if (window.innerHeight <= 170) {
      recordDiff = 1;
    }

    toNumber = fromNumber + recordDiff;

    fetchDataScreenSize(fromNumber, toNumber);
  };

  resizeScreen = debounce(resizeScreen, 700);
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
  console.log(typeof fromNumber, typeof toNumber);
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

// Checks if you looking for a single or multiple records.
function recordSelection() {
  let selectionArea: any = recordNav;
  let SingleRecordSelection = `
    <button id="return-btn">Return</button>
      <div id="user-input-data">
        <div class="navigation-input-area-id" id="id">
          <label class="record-labels" for="record-id"
            >Enter record ID :
          </label>
          <input
            type="text"
            min="0"
            minlength="1"
            maxlength="6"
            name="record-id"
            id="record-id"
            class="navigation-input"
            value="0"
          />
        </div>
        <p class="amount-of-records"></p>
      </div>
    <button id="get-record-btn">See Record</button>
    `;

  selectionArea.innerHTML = "";
  selectionArea.innerHTML = SingleRecordSelection;

  let returnBtn: any = document.querySelector("#return-btn");

  returnBtn.addEventListener("click", () => {
    headingColumns.innerHTML = "";
    infoColumns.innerHTML = "";
    fetchData();
    createNavigation();
  });

  let getSingleRecord: any = document.querySelector("#get-record-btn");

  getSingleRecord.addEventListener("click", () => {
    let recordIdValue: any = document.querySelector(
      "#record-id.navigation-input"
    );
    console.log(recordIdValue.value);

    let fromNumber: number = Number(recordIdValue.value);
    let toNumber: any;
    let recordDiff: any;

    console.log(typeof fromNumber === "string");

    let check = ["undefined", "string", ""];

    if (check.includes(typeof fromNumber) || fromNumber < 0) {
      alert("Does not exists");
      recordIdValue.value = "0";
    } else if (typeof fromNumber === "number" && fromNumber >= 0) {
      let resizeScreen = () => {
        if (window.innerHeight > 500) {
          recordDiff = 14;
        } else if (window.innerHeight <= 500 && window.innerHeight > 350) {
          recordDiff = 10;
        } else if (window.innerHeight <= 350 && window.innerHeight > 170) {
          recordDiff = 2;
        } else if (window.innerHeight <= 170) {
          recordDiff = 1;
        }

        toNumber = fromNumber + recordDiff;

        console.log(fromNumber, toNumber);

        if (toNumber > 999999) {
          alert("This is the last page.");
          fromNumber = 999999 - recordDiff;
          toNumber = fromNumber + recordDiff;
          console.log(fromNumber, toNumber), recordDiff;
        } else if (fromNumber > 999985) {
          fromNumber = 999985;
          toNumber = fromNumber + recordDiff;
        } else {
          //pass
        }
        infoColumns.innerHTML = "";
        fetchDataScreenSize(fromNumber, toNumber);
      };

      resizeScreen = debounce(resizeScreen, 700);
      window.addEventListener("resize", resizeScreen);
      resizeScreen();
    } else {
      alert("Error");
    }
  });
}
