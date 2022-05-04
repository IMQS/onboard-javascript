let headingColumns: any = document.querySelector("#column-headings-container"); // Headings
let infoColumns: any = document.querySelector("#info-columns-container"); // Information
let debounce = (func: any, delay: number) => {
  let timer: number;
  return function () {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func();
    }, delay);
  };
};

let createNavigation = () => {
  let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
  recordNav.innerHTML = `
  <div class="navigation-btns">
    <button value="first" class="first-page-btn">First Page</button>  
    <button value="previous" class="previous-records-btn">Previous</button>
    <button value="next" class="next-records-btn">Next</button>
    <button value="last" class="last-page-btn">Last Page</button>  
    <button onclick="recordSelection()" id="confirmation-btn">Get Record</button>
  </div>
  <div class="current-page-container">
    <p class=current-page></p>
  </div>
  `;
};

function recordSelection() {
  let selectionArea: any = document.querySelector("#record-navigation-container");
  let singleRecordSelection = `
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
  selectionArea.innerHTML = singleRecordSelection;

  let returnBtn: any = document.querySelector("#return-btn");

  returnBtn.addEventListener("click", () => {
    headingColumns.innerHTML = "";
    infoColumns.innerHTML = "";
    headingRowCreation();
    createNavigation();
  });

  let getSingleRecord: any = document.querySelector("#get-record-btn");

  getSingleRecord.addEventListener("click", () => {
    let recordIdValue: any = document.querySelector("#record-id.navigation-input");
    let fromNumber: number = Number(recordIdValue.value);
    let check = ["undefined", "string", ""];

    if (check.includes(typeof fromNumber) || fromNumber < 0) {
      alert("Does not exists");
      recordIdValue.value = "0";
    } else if (typeof fromNumber === "number" && fromNumber >= 0) {
      dataRowCreation(fromNumber);
    } else {
      alert("Error");
    }
  });
}

let pageNavigation = (fromNumber: number, numberOfRows: number) => {
  let count: number = 0;
  let value: string;

  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");
  let firstPageBtn: any = document.querySelector(".first-page-btn");
  let lastPageBtn: any = document.querySelector(".last-page-btn");

  if (fromNumber + numberOfRows === 999999) {
    nextBtn.disabled = true;
    previousBtn.disabled = false;
  } else if (fromNumber === 0) {
    nextBtn.disabled = false;
    previousBtn.disabled = true;
  }

  let navigation = () => {
    console.log(value);

    if (value === "next") {
      fromNumber = fromNumber + numberOfRows * count;
    } else if (value === "previous") {
      fromNumber = fromNumber - numberOfRows * count;
    } else if (value === "first") {
      fromNumber = 0;
    } else if (value === "last") {
      let toNumber = 999999;
      fromNumber = toNumber - numberOfRows;
      console.log(fromNumber, numberOfRows);
    }

    dataRowCreation(fromNumber), 500;
  };

  navigation = debounce(navigation, 1000);

  nextBtn.addEventListener("click", () => {
    count++;
    value = nextBtn.value;
    navigation();
  });

  previousBtn.addEventListener("click", () => {
    count++;
    value = previousBtn.value;
    navigation();
  });

  firstPageBtn.addEventListener("click", () => {
    value = firstPageBtn.value;
    navigation();
  });

  lastPageBtn.addEventListener("click", () => {
    value = lastPageBtn.value;
    navigation();
  });
};

function createHeadingGrid(headings: any) {
  let headingsData: any = `<h1 class="column-heading">${headings}</h1>`;
  headingColumns.innerHTML += headingsData;
}

let headingRowCreation = () => {
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
      dataRowCreation(0);
    })
    .catch((error) => {
      console.log(error);
    });
  createNavigation();
};

function dynamicGrid(columnData: any) {
  // Creates the row that the info will display and adds it to the infoColumnsArea.
  let infoDataRow = `<div id="info-row-${columnData[0]}" class="info-rows"></div>`;
  infoColumns.innerHTML += infoDataRow;
  // Gets the created rows.
  let finalInfoDataRow: any = document.querySelector("#info-row-" + columnData[0] + ".info-rows");

  // Loops through
  for (let x = 0; x < columnData.length; x++) {
    let infoData = `<p class="info-row-data">${columnData[x]}</p>`;
    finalInfoDataRow.innerHTML += infoData;
  }
}

function dataRowCreation(fromNumber: number) {
  let toNumber: number;

  let resizeScreenData = () => {
    let selectionArea: any = document.querySelector("#record-navigation-container");

    if (selectionArea.contains(document.querySelector(".navigation-btns"))) {
      let nextBtn: any = document.querySelector(".next-records-btn");
      let previousBtn: any = document.querySelector(".previous-records-btn");
      let numberOfRows = Math.floor(window.innerHeight / 50);

      nextBtn.disabled = false;
      previousBtn.disabled = false;

      if (fromNumber + numberOfRows > 999999) {
        let toNumber = 999999;
        fromNumber = toNumber - numberOfRows;
        nextBtn.disabled = true;
        previousBtn.disabled = false;
      } else if (fromNumber < 0) {
        nextBtn.disabled = false;
        previousBtn.disabled = true;
        fromNumber = 0;
      }
      toNumber = fromNumber + numberOfRows;

      pageNavigation(fromNumber, numberOfRows);
      let currentPage: any = document.querySelector(".current-page");
      currentPage.innerHTML = currentPage.innerHTML = `${fromNumber}  / ${toNumber}  ${Number(numberOfRows) + 1} records only.`;
    }

    fetch("http://localhost:2050/records?from=" + fromNumber + "&to=" + toNumber, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.text())
      .then((data) => {
        let columnDataList = JSON.parse(data);
        infoColumns.innerHTML = "";
        for (let i = 0; i < columnDataList.length; i++) {
          dynamicGrid(columnDataList[i]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  resizeScreenData = debounce(resizeScreenData, 500);
  window.addEventListener("resize", resizeScreenData);
  resizeScreenData();
}

headingRowCreation();
