const headings: any = document.querySelector("#Headings");
const content_cols: any = document.querySelector("#Content");
const lists: any = document.querySelector('#content_row')
const pageStats: any = document.getElementById('pageStats')
const clear = "";
const nextButton: any = document.querySelector("#next");
const prevButton: any = document.querySelector("#prev");
let arrChild: any = []
let paramOne: any = 0
let paramTwo: any = 9
let contentNeeded: any = [];
let contentListNeeded: any = []
let nextCounter = 0;
let nextBtnStatus: any = false;
let nextTurnFalse: any;
let nextActCheck: any;
let prevCounter = 0;
let prevBtnStatus: any = false;
let prevTurnFalse: any;
let prevActCheck: any;

// Fetch requests

//// Heading Row(The Columns)

function getColumns() {
    fetch("http://localhost:2050/columns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
})
    .then((res) => res.text())
    .then((data) => {
        data = JSON.parse(data);
        let colList = data;
        for (let i = 0; i < colList.length; i++) {
            colHeading(colList[i]);
        }
    });
}

//// Table Content

function getTable() {
    fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.text())
    .then((data) => {
        data = JSON.parse(data);
        let contentList = data;
        // console.log(contentList);
        for (let i = 0; i < contentList.length; i++) {
            let contentListContent: any = contentList[i]
            cols(contentListContent)
        }
    }); 
}

//// Display the current shown results

function stats() {
    fetch("http://localhost:2050/recordCount", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
})
    .then((res) => res.text())
    .then((data) => {
        data = JSON.parse(data);
        let count = data;
        let currentStats = "Showing results from " + paramOne + " to " + paramTwo + " out of " + count + " results.";
        pageStats.innerHTML = currentStats;
    })
}


// Loads all intial fields/data

window.onload = function() {
    stats()
    getColumns()
    getTable()
}

// Displaying data into html

//// Targets heading div to creating the 1st row(Column names)

function colHeading(heading: string) {
    let headingCol = `<div id="col_heading" class="col_heading">${heading}</div>`;
    headings.innerHTML += headingCol;
}

//// Targets content div to create the actual table and fill with data

let columnRowData: any = []

function cols(content: any) {
    let rows = `<div id=row-${content[0]} class="rows"></div>`;

    content_cols.innerHTML += rows;

    let finalRow: any = document.querySelector("#row-" + content[0] + ".rows");

    for (let x = 0; x < content.length; x++) {
        let rowCols = `<div class="row-cols">${content[x]}</div>`;
        finalRow.innerHTML += rowCols;
    }
}



// Clear Table (content div)

function clearTable() {
    content_cols.innerHTML = clear
}

// // ID Search

// window.addEventListener("keydown", (e) => {
//     let key = e.key;

//     if (key === "Enter") {
//         let search: any = document.querySelector('#idInput');
//         clearTable()
//         if (search.value != "" && search.value < 1000000 && search.value >= 0) {
//             pageStats.innerHTML = clear
//             let searchStats = "Showing result with ID of " + search.value;
//             pageStats.innerHTML = searchStats;
//             fetch("http://localhost:2050/records?from=" + search.value + "&to=" + search.value, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             })
//             .then((res) => res.text())
//             .then((data) => {
//                 data = JSON.parse(data);
//                 let contentList = data;
//                 for (let i = 0; i < contentList.length; i++) {
//                     contentNeeded.push(contentList[i])
//                     cols(contentList[i])
//                 }
//             });
//         } else {
//             alert("There are no results with that ID!")
//             stats()
//             getTable()
//         }
//         search.value = clear
//     }
// })

// Jump to ID  

function idJump() {
    let search: any = document.querySelector('#idJump');
    let searchOne = search.value
    let convert = parseInt(searchOne) + 9
    let searchTwo = convert.toString()
    paramOne = searchOne
    paramTwo = searchTwo

    if (searchOne !== "" && searchOne <= 999990 && searchOne >= 0 && searchOne !== 'e') {
        clearTable()
        fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
        stats()
    } else if ( searchOne > 999990 && searchOne < 1000000 && searchOne >= 0 && searchOne !== 'e') {
        clearTable()
        fetch("http://localhost:2050/records?from=" + searchOne + "&to=" + 999999, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
        fetch("http://localhost:2050/recordCount", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let count = data;
            let currentStats = "Showing results from ID " + searchOne + " to " + 999999 + " out of " + count + " results.";
            pageStats.innerHTML = currentStats;
        })
    } else {
        alert("There are no records with that ID! Please check that your input does not exceed 999 999 and is not a negative amount.")
        clearTable()
        paramOne = 0
        paramTwo = 9
        stats()
        getTable()
    }
    search.value = clear
}

// Nav Buttons

//// Next Function

function next() {
    if (paramTwo < 999999) {

        let intOne = parseInt(paramOne) + (10 * nextCounter)
        let intTwo = parseInt(paramTwo) + (10 * nextCounter)
        paramOne = intOne.toString()
        paramTwo = intTwo.toString()

        stats()
        clearTable()
        fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
    } else {
        paramOne = 0
        paramTwo = 9
        stats()
        clearTable()
        fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
    }
    nextCounter = 0
}

nextButton.addEventListener("click", () => {
    clearTimeout(nextTurnFalse)
    clearTimeout(nextBtnStatus)
    nextCounter += 1
    nextBtnStatus = true
    nextTurnFalse = setTimeout(nextBtnFalse, 100)
    nextActCheck = setTimeout(nextCheck, 200)
})

function nextBtnFalse() {
    nextBtnStatus = false
}

function nextCheck() {
    if (nextBtnStatus) {
        // pass
    } else {
        next()
    }
}

//// Prev Function

function prev() {
    if (paramOne >= 10) {

        let intOne = parseInt(paramOne) - (10 * prevCounter)
        let intTwo = parseInt(paramTwo) - (10 * prevCounter)
        paramOne = intOne.toString()
        paramTwo = intTwo.toString()
        
        stats()
        clearTable()
        fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
    } else {
        paramOne = 999990
        paramTwo = 999999
        stats()
        clearTable()
        fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            for (let i = 0; i < contentList.length; i++) {
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
    }
    prevCounter = 0
}

prevButton.addEventListener("click", () => {
    clearTimeout(prevTurnFalse)
    clearTimeout(prevBtnStatus)
    prevCounter += 1
    prevBtnStatus = true
    prevTurnFalse = setTimeout(prevBtnFalse, 100)
    prevActCheck = setTimeout(prevCheck, 200)
})

function prevBtnFalse() {
    prevBtnStatus = false
}

function prevCheck() {
    if (prevBtnStatus) {
        // pass
    } else {
        prev()
    }
}