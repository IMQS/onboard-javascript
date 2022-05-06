let fromParameter = 0;
let timer: number;
let recordCount: number;

//// On Window Load
window.onload = function () {
    getRecordCount()
        .then(() => {
            return getHeadings();
        })
        .then(() => {
            return getTable();
        });
    console.log("CALL HECTOR!!!");
};

function getParameters(fromParameter: number) {
    let toParameter: number;
    let noOfRows = getNoOfRows();

    toParameter = fromParameter + noOfRows;
    return toParameter;
}

function getNoOfRows(): number {
    const height = window.innerHeight;
    let noOfRows = Math.floor(height / 40);
    return noOfRows;
}

//// Functions To Create/Clear The HTML
// Heading Row
function createHeadingRow(headingData: string) {
    const heading: HTMLElement | null = document.getElementById("heading");

    let headings = `<div class="headings" id="headings">${headingData}</div>`;
    if (heading !== null) {
        heading.innerHTML += headings;
    }
}

// Table Content
function createTableContent(contentData: string) {
    const content: any = document.querySelector("#content");

    let table = `<div id="row-${contentData[0]}" class="rows"></div>`;
    content.innerHTML += table;

    let rows: any = document.querySelector("#row-" + contentData[0] + ".rows");
    for (let x = 0; x < contentData.length; x++) {
        let rowCols = `<div class="row_cols">${contentData[x]}</div>`;
        rows.innerHTML += rowCols;
    }
}

//// Fetch Requests
// Heading Row (Getting the columns data)
function getHeadings() {
    return fetch("http://localhost:2050/columns", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.text())
        .then((data) => {
            let headingData = JSON.parse(data);
            for (let i = 0; i < headingData.length; i++) {
                createHeadingRow(headingData[i]);
            }
            getParameters(0);
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

// Table Content (Getting the table's data)
function getTable() {
    const content: any = document.querySelector("#content");
    let toParameter = getParameters(fromParameter);
    const pageStats: any = document.querySelector("#pageStats");

    // Clears Table
    content.innerHTML = "";

    // Displays The Current Results Being Shown
    let currentStats = `Showing results from ${fromParameter} to ${toParameter} out of ${recordCount} results.`;
    pageStats.innerHTML = currentStats;

    return fetch(`http://localhost:2050/records?from=${fromParameter}&to=${toParameter}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.text())
        .then((data) => {
            let contentData = JSON.parse(data);
            for (let i = 0; i < contentData.length; i++) {
                createTableContent(contentData[i]);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

function getRecordCount() {
    return fetch("http://localhost:2050/recordCount", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.text())
        .then((data) => {
            recordCount = JSON.parse(data);
        })
        .catch((error) => {
            console.log(error);
        });
}

//// Debounce
function debounce(fn: any, delay: number) {
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn();
        }, delay);
    };
}

//// Sizing And Resizing
function resizing() {
    let end = fromParameter + getNoOfRows();
    let toParameter: number;
    let maxRecordsID = recordCount - 1;

    if (end > maxRecordsID) {
        toParameter = maxRecordsID;
        fromParameter = toParameter - getNoOfRows();
    } else {
        toParameter = fromParameter + getNoOfRows();
    }
    getTable();
}

window.addEventListener("resize", debounce(resizing, 500));

//// Navigation
// Next
{
    let nextCount = 0;
    const nextButton: HTMLElement | null = document.getElementById("next");

    const nextDebounce = (fn: any, delay: number) => {
        return function () {
            nextCount++;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn();
            }, delay);
        };
    };

    let next = () => {
        let toParameter = getParameters(fromParameter);
        let maxRecordsID = recordCount - 1;

        if (toParameter === maxRecordsID) {
            alert("You have reached the final page");
        }

        let nextAmount = toParameter - fromParameter + 1;
        let nextCountAmount = nextAmount * nextCount;
        fromParameter = fromParameter + nextCountAmount;
        toParameter = fromParameter + getNoOfRows();

        let end = fromParameter + getNoOfRows();

        if (end > maxRecordsID) {
            toParameter = maxRecordsID;
            fromParameter = toParameter - getNoOfRows();
        }

        nextCount = 0;

        getTable();
    };

    if (nextButton !== null) {
        nextButton.addEventListener("click", nextDebounce(next, 500));
    }
}

// Previous
{
    let prevCount = 0;
    const prevButton: any = document.querySelector("#prev");

    const prevDebounce = (fn: any, delay: number) => {
        return function () {
            prevCount++;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn();
            }, delay);
        };
    };

    let prev = () => {
        let toParameter = getParameters(fromParameter);

        if (fromParameter === 0) {
            alert("You Are On The First Page");
        } else {
            let prevAmount = toParameter - fromParameter + 1;
            let prevCountAmount = prevAmount * prevCount;

            let intOne = fromParameter - prevCountAmount;

            if (intOne < 0) {
                fromParameter = 0;
            } else {
                fromParameter = intOne;
            }

            prevCount = 0;

            getTable();
        }
    };

    prevButton.addEventListener("click", prevDebounce(prev, 500));
}

// ID Jump
{
    const input: any = document.querySelector("input");

    let idJump = () => {
        let toParameter = getParameters(fromParameter);
        let currentID = fromParameter;
        let search = input.value;
        let end = parseInt(search) + getNoOfRows();
        let maxRecordsID = recordCount - 1;

        if (search !== NaN && search !== "" && search <= maxRecordsID && search >= 0) {
            if (end > maxRecordsID) {
                toParameter = maxRecordsID;
                fromParameter = toParameter - getNoOfRows();
            } else {
                fromParameter = parseInt(search);
                toParameter = fromParameter + getNoOfRows();
            }
        } else if (search !== "") {
            alert("Make Sure Your Desired ID Is Not A Negative Number Or Doesn't Exceed 999999");
            fromParameter = currentID;
            toParameter = fromParameter + getNoOfRows();
            input.value = "";
        }

        getTable();
    };

    window.addEventListener("input", debounce(idJump, 500));
}
