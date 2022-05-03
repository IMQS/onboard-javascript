let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;
let debounce = (func: any, delay: number) => {
  let timer: number;
  return function () {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func();
    }, delay);
  };
};

let tryCatch = (func: any) => {
  try {
    func;
  } catch (error) {
    console.log(error);
  }
};

function createNavigation() {
  let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
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

function createHeadingGrid(headings: any) {
  let headingsData: any = `<h1 class="column-heading">${headings}</h1>`;
  headingColumns.innerHTML += headingsData;
}

function headingRowCreation() {
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
    });
  createNavigation();
}

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

let nextPrevious = (fromNumber: number) => {
  let numberOfRows = Math.floor(window.innerHeight / 50);
  let count: number = 0;

  let nextBtn: any = document.querySelector(".next-records-btn");
  let nextPage = () => {
    fromNumber = fromNumber + numberOfRows * count;
    tryCatch(dataRowCreation(fromNumber));
    count = 0;
  };

  nextPage = debounce(nextPage, 500);
  nextBtn.addEventListener("click", () => {
    count++;
    nextPage();
  });

  let previousBtn: any = document.querySelector(".previous-records-btn");
  let previousPage = () => {
    fromNumber = fromNumber - numberOfRows * count;
    tryCatch(dataRowCreation(fromNumber));
    count = 0;
  };

  previousPage = debounce(previousPage, 500);
  previousBtn.addEventListener("click", () => {
    count++;
    previousPage();
  });

  if (fromNumber === 0) {
    previousBtn.disabled = true;
  } else {
    previousBtn.disabled = false;
  }

  let firstBtn: any = document.querySelector(".first-page-btn");
  let firstPage = () => {
    fromNumber = 0;
    tryCatch(dataRowCreation(fromNumber));
  };

  firstPage = debounce(firstPage, 500);
  firstBtn.addEventListener("click", () => {
    firstPage();
  });

  let lastBtn: any = document.querySelector(".last-page-btn");
  let lastPage = () => {
    let toNumber = 999999;
    fromNumber = toNumber - numberOfRows;
    tryCatch(dataRowCreation(fromNumber));
  };

  lastPage = debounce(lastPage, 500);
  lastBtn.addEventListener("click", () => {
    lastPage();
  });
};

function dataRowCreation(fromNumber: number) {
  let toNumber: number;

  let resizeScreen = () => {
    let nextBtn: any = document.querySelector(".next-records-btn");
    nextBtn.disabled = false;
    let numberOfRows = Math.floor(window.innerHeight / 50);
    toNumber = fromNumber + numberOfRows;

    if (toNumber >= 999999) {
      let nextBtn: any = document.querySelector(".next-records-btn");

      toNumber = 999999;
      fromNumber = toNumber - numberOfRows;

      nextBtn.disabled = true;
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
      });

    let currentPage: any = document.querySelector(".current-page");
    currentPage.innerHTML = "";
    currentPage.innerHTML = currentPage.innerHTML = fromNumber + " / " + toNumber + " " + (Number(numberOfRows) + 1) + " records only.";
  };

  resizeScreen = debounce(resizeScreen, 500);
  window.addEventListener("resize", resizeScreen);
  tryCatch(resizeScreen());
  tryCatch(nextPrevious(fromNumber));
}

headingRowCreation();

function recordSelection() {
  let selectionArea: any = document.querySelector("#record-navigation-container");
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
