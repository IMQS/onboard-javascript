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

function createNavigation() {
    let recordNav: HTMLElement | null = document.getElementById("record-navigation-container"); // Navigation area
    if (recordNav !== null) {
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
    }
}

function recordSelection() {
    let recordNav: HTMLElement | null = document.getElementById("record-navigation-container"); // Navigation area
    if (recordNav !== null) {
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

        recordNav.innerHTML = singleRecordSelection;

        let returnBtn: HTMLElement | null = document.getElementById("return-btn");
        let recordIdInput: any = document.getElementById("record-id.navigation-input");
        let numberOfRows = Math.floor(window.innerHeight / 50);
        let getSingleRecord: HTMLElement | null = document.getElementById("get-record-btn");

        if (returnBtn !== null && getSingleRecord !== null && recordIdInput !== null) {
            let recordIdValue = recordIdInput.value;
            returnBtn.addEventListener("click", () => {
                fromNumber = 0;
                let toNumber = fromNumber + numberOfRows;
                getRecords(fromNumber, toNumber);
            });

            getSingleRecord.addEventListener("click", () => {
                fromNumber = Number(recordIdValue);
                let toNumber = fromNumber + numberOfRows;
                let finalRecord = recordNumberTotal - 1;

                if (toNumber > finalRecord) {
                    toNumber = finalRecord;
                    fromNumber = toNumber - numberOfRows;
                }

                let check = ["undefined", "string", ""];

                if (check.includes(typeof fromNumber) || fromNumber < 0) {
                    alert("Does not exists");
                    recordIdValue = "0";
                } else if (typeof fromNumber === "number" && fromNumber >= 0) {
                    getRecords(fromNumber, toNumber);
                }
            });
        }
    }
}

function createHeadingGrid(headings: any) {
    let headingColumns: HTMLElement | null = document.getElementById("column-headings-container"); // Headings
    let headingsData = `<h1 class="column-heading">${headings}</h1>`;

    if (headingColumns !== null) {
        headingColumns.innerHTML += headingsData;
    }
}

function recordCount() {
    return fetch("http://localhost:2050/recordCount", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response: Response) => response.text())
        .then((data) => {
            recordNumberTotal = JSON.parse(data);
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

function headingRowCreation() {
    fetch("http://localhost:2050/columns", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response: Response) => response.text())
        .then((data) => {
            let headingDataList = JSON.parse(data);
            let headings: string;

            for (let i = 0; i < headingDataList.length; i++) {
                headings = headingDataList[i];
                createHeadingGrid(headings);
            }
            resizeScreenData();
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

function dynamicGrid(columnData: any) {
    let infoColumns: HTMLElement | null = document.getElementById("info-columns-container"); // Information
    // Creates the row that the info will display and adds it to the infoColumnsArea.
    let infoDataRow = `<div id="info-row-${columnData[0]}" class="info-rows"></div>`;

    if (infoColumns !== null) {
        infoColumns.innerHTML += infoDataRow;
        // Gets the created rows.
        let finalInfoDataRow: HTMLElement | null = document.getElementById("info-row-" + columnData[0] + ".info-rows");
        if (finalInfoDataRow !== null) {
            // Loops through
            for (let x = 0; x < columnData.length; x++) {
                let infoData = `<p class="info-row-data">${columnData[x]}</p>`;
                finalInfoDataRow.innerHTML += infoData;
            }
        }
    }
}

function resizeScreenData() {
    let toNumber: number;
    let recordNav: HTMLElement | null = document.getElementById("record-navigation-container");
    let navBtns: any = document.getElementsByClassName("navigation-btns");
    if (recordNav !== null) {
        if (recordNav.contains(navBtns)) {
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
    }
}

function getRecords(fromNumber: number, toNumber: number) {
    return fetch(`http://localhost:2050/records?from=${fromNumber}&to=${toNumber}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response: Response) => response.text())
        .then((data) => {
            let columnDataList = JSON.parse(data);
            let infoColumns: HTMLElement | null = document.getElementById("info-columns-container"); // Information
            let currentPage: any = document.getElementsByClassName("current-page");

            if (infoColumns !== null && currentPage !== null) {
                infoColumns.innerHTML = "";
                for (let i = 0; i < columnDataList.length; i++) {
                    dynamicGrid(columnDataList[i]);
                }

                currentPage.innerHTML = `${fromNumber}  / ${toNumber}.`;
            }
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

recordCount();
window.addEventListener("resize", debounce(resizeScreenData, 500));
createNavigation();
headingRowCreation();

let nextBtn: any = document.getElementsByClassName("next-records-btn");
let previousBtn: any = document.getElementsByClassName("previous-records-btn");
let firstPageBtn: any = document.getElementsByClassName("first-page-btn");
let lastPageBtn: any = document.getElementsByClassName("last-page-btn");

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
