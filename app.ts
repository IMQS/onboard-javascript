let fromParameter = 0;
let timer: number;
let recordCount: number;

//// On Window Load
window.onload = function () {
    const next = new Next(); // next class
    const prev = new Prev(); // prev class
    window.addEventListener("input", debounce(idJump, 500));
    window.addEventListener("resize", debounce(resizing, 500));
    getRecordCount()
        .then(() => {
            return getHeadings();
        })
        .then(() => {
            return getTable();
        });
};

// Gets The 2nd paramater from the 1st parameter
function getParameters(fromParameter: number): number {
    let toParameter: number;
    let noOfRows = getNoOfRows();

    toParameter = fromParameter + noOfRows;
    return toParameter;
}

// Gets the number of rows on the screen
function getNoOfRows(): number {
    const height = window.innerHeight;
    let noOfRows = Math.floor(height / 40);
    return noOfRows;
}

//// Functions To Create The HTML
// Heading Row
function createHeadingRow(headingData: string) {
    const heading: HTMLElement | null = document.getElementById("heading");

    let headings = `<div class="headings" id="headings">${headingData}</div>`;
    if (heading !== null) {
        heading.innerHTML += headings;
    }
}

// Table Content
function createTableContent(contentData: any) {
    const content: HTMLElement | null = document.getElementById("content");

    let table = `<div id="row-${contentData[0]}" class="rows"></div>`;
    if (content !== null) {
        content.innerHTML += table;
    } else {
        alert("ERROR");
    }

    let rows: HTMLElement | null = document.getElementById("row-" + contentData[0]);
    for (let x of contentData) {
        let rowCols = `<div class="row_cols">${x}</div>`;
        if (rows !== null) {
            rows.innerHTML += rowCols;
        }
    }
}

//// Fetch Requests
// Response Error Handling
function handleErrors(response: Response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Heading Row (Getting the columns data)
function getHeadings(): Promise<void> {
    return fetch("http://localhost:2050/columns", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(handleErrors)
        .then((response: Response) => response.json())
        .then((data: string) => {
            let headingData = data;
            for (let heading of headingData) {
                createHeadingRow(heading);
            }
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

// Table Content (Getting the table's data)
function getTable(): Promise<void> {
    const content: HTMLElement | null = document.getElementById("content");
    let toParameter = getParameters(fromParameter);
    const pageStats: HTMLElement | null = document.getElementById("pageStats");

    // Clears Table
    if (content !== null) {
        content.innerHTML = "";
    }

    // Displays The Current Results Being Shown
    let currentStats = `Showing results from ${fromParameter} to ${toParameter} out of ${recordCount} results.`;
    if (pageStats !== null) {
        pageStats.innerHTML = currentStats;
    }

    return fetch(`http://localhost:2050/records?from=${fromParameter}&to=${toParameter}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(handleErrors)
        .then((res: Response) => res.json())
        .then((data: string) => {
            let contentData = data;
            for (let content of contentData) {
                createTableContent(content);
            }
        })
        .catch((error: Error) => {
            console.log(error);
        });
}

// Gets Total Of All Records
function getRecordCount(): Promise<void> {
    return fetch("http://localhost:2050/recordCount", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(handleErrors)
        .then((res: Response) => res.json())
        .then((data: number) => {
            recordCount = data;
        })
        .catch((error: Error) => {
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
    }
    getTable();
}

//// Navigation
// Next
class Next {
    nextCount: number;
    nextButton: HTMLElement | null;

    constructor() {
        this.nextCount = 0;
        this.nextButton = document.getElementById("next");

        const nextDebounce = (fn: any, delay: number) => {
            return () => {
                this.nextCount++;
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
            let nextCountAmount = nextAmount * this.nextCount;
            fromParameter = fromParameter + nextCountAmount;
            toParameter = fromParameter + getNoOfRows();

            let end = fromParameter + getNoOfRows();

            if (end > maxRecordsID) {
                toParameter = maxRecordsID;
                fromParameter = toParameter - getNoOfRows();
            }

            this.nextCount = 0;

            getTable();
        };

        if (this.nextButton) {
            this.nextButton.addEventListener("click", nextDebounce(next, 500));
        }
    }
}

// Previous
class Prev {
    prevCount: number;
    prevButton: HTMLElement | null;

    constructor() {
        this.prevCount = 0;
        this.prevButton = document.getElementById("prev");

        const prevDebounce = (fn: any, delay: number) => {
            return () => {
                this.prevCount++;
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
                let prevCountAmount = prevAmount * this.prevCount;

                let intOne = fromParameter - prevCountAmount;

                if (intOne < 0) {
                    fromParameter = 0;
                } else {
                    fromParameter = intOne;
                }

                this.prevCount = 0;

                getTable();
            }
        };

        if (this.prevButton) {
            this.prevButton.addEventListener("click", prevDebounce(prev, 500));
        }
    }
}

// ID Jump
function idJump() {
    const input: any = document.querySelector("input");
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
}
