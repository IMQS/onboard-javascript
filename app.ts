let headingColumns: any = document.querySelector("#column-headings-container"); // Headings
let infoColumns: any = document.querySelector("#info-columns-container"); // Information
let fromNumber = 0;
let recordNumberTotal: number;
let count = 0;
let timeout = 0;

window.onload = () => {
  fromNumber = 0;
};

let debounce = (func: any, delay: number) => {
  return function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func();
    }, delay);
  };
};

let createNavigation = () => {
  let recordNav: any = document.querySelector("#record-navigation-container"); // Navigation area
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

  selectionArea.innerHTML = singleRecordSelection;

  let returnBtn: any = document.querySelector("#return-btn");
  let recordIdValue: any = document.querySelector("#record-id.navigation-input");
  let numberOfRows = Math.floor(window.innerHeight / 50);

  returnBtn.addEventListener("click", () => {
    window.location.reload();
  });

  let getSingleRecord: any = document.querySelector("#get-record-btn");

  getSingleRecord.addEventListener("click", () => {
    fromNumber = Number(recordIdValue.value);
    let toNumber = fromNumber + numberOfRows;
    let finalRecord = recordNumberTotal - 1;

    if (toNumber > finalRecord) {
      toNumber = finalRecord;
      fromNumber = toNumber - numberOfRows;
    }

    let check = ["undefined", "string", ""];

    try {
      if (check.includes(typeof fromNumber) || fromNumber < 0) {
        alert("Does not exists");
        recordIdValue.value = "0";
      } else if (typeof fromNumber === "number" && fromNumber >= 0) {
        getRecords(fromNumber, toNumber);
      }
    } catch (error) {
      alert(error);
    }
  });
}

function createHeadingGrid(headings: any) {
  let headingsData: any = `<h1 class="column-heading">${headings}</h1>`;
  headingColumns.innerHTML += headingsData;
}

let recordCount = () => {
  fetch("http://localhost:2050/recordCount", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.text())
    .then((data) => {
      recordNumberTotal = JSON.parse(data);
    })
    .catch((error) => {
      console.log(error);
    });
};

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
      resizeScreenData();
    })
    .catch((error) => {
      console.log(error);
    });
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

let resizeScreenData = () => {
  let toNumber: number;
  let selectionArea: any = document.querySelector("#record-navigation-container");

  if (selectionArea.contains(document.querySelector(".navigation-btns"))) {
    let numberOfRows = Math.floor(window.innerHeight / 50);

    nextBtn.disabled = false;
    previousBtn.disabled = false;

    let finalRecord = recordNumberTotal - 1;

    if (fromNumber + numberOfRows >= finalRecord) {
      fromNumber = finalRecord - numberOfRows;
      nextBtn.disabled = true;
      previousBtn.disabled = false;
    } else if (fromNumber <= 0) {
      nextBtn.disabled = false;
      previousBtn.disabled = true;
      fromNumber = 0;
    }

    toNumber = fromNumber + numberOfRows;

    getRecords(fromNumber, toNumber);
  }
};

function getRecords(fromNumber: number, toNumber: number) {
  fetch(`http://localhost:2050/records?from=${fromNumber}&to=${toNumber}`, {
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

      let currentPage: any = document.querySelector(".current-page");
      currentPage.innerHTML = `${fromNumber}  / ${toNumber}.`;
    })
    .catch((error) => {
      console.log(error);
    });
}

recordCount();
resizeScreenData = debounce(resizeScreenData, 500);
window.addEventListener("resize", resizeScreenData);
createNavigation();
headingRowCreation();

let nextBtn: any = document.querySelector(".next-records-btn");
let previousBtn: any = document.querySelector(".previous-records-btn");
let firstPageBtn: any = document.querySelector(".first-page-btn");
let lastPageBtn: any = document.querySelector(".last-page-btn");

console.log(fromNumber);

let nextPage = () => {
  console.log(fromNumber);
  let numberOfRows = Math.floor(window.innerHeight / 50);
  fromNumber = fromNumber + numberOfRows * count;
  let toNumber = fromNumber + numberOfRows;

  let finalRecord = recordNumberTotal - 1;

  if (toNumber >= finalRecord) {
    fromNumber = finalRecord - numberOfRows;
    nextBtn.disabled = true;
    previousBtn.disabled = false;
  }

  getRecords(fromNumber, toNumber);
  count = 0;
};

nextBtn.addEventListener("click", () => {
  count++;
  nextPage = debounce(nextPage, 500);
  nextPage();
});

let previousPage = () => {
  let numberOfRows = Math.floor(window.innerHeight / 50);
  fromNumber = fromNumber - numberOfRows * count;
  let toNumber = fromNumber + numberOfRows;

  if (fromNumber <= 0) {
    nextBtn.disabled = false;
    previousBtn.disabled = true;
    fromNumber = 0;
  }

  getRecords(fromNumber, toNumber);
  count = 0;
};

previousBtn.addEventListener("click", () => {
  count++;
  previousPage = debounce(previousPage, 500);
  previousPage();
});

let firstPage = () => {
  fromNumber = 0;
  let numberOfRows = Math.floor(window.innerHeight / 50);
  let toNumber = fromNumber + numberOfRows;
  previousBtn.disabled = true;
  nextBtn.disabled = false;

  getRecords(fromNumber, toNumber);
};

firstPageBtn.addEventListener("click", () => {
  firstPage();
});

let lastPage = () => {
  let finalRecord = recordNumberTotal - 1;
  let numberOfRows = Math.floor(window.innerHeight / 50);
  fromNumber = finalRecord - numberOfRows;
  nextBtn.disabled = true;
  previousBtn.disabled = false;

  getRecords(fromNumber, finalRecord);
};

lastPageBtn.addEventListener("click", () => {
  lastPage();
});
