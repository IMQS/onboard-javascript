let paramOne = 0
let paramTwo = 9
let contentNeeded: any = [];
let headings: any = document.querySelector("#Headings");
let content_cols: any = document.querySelector("#Content");
let pageStats: any = document.getElementById('pageStats')
let clear = "";
let prevButton: any = document.querySelector('#prev')
let nextButton: any = document.querySelector('#next')

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
        // console.log(colList);
        for (let i = 0; i < colList.length; i++) {
            // console.log(colList[i]);
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
        for (let i = 0; i < contentList.length; i++) {
            contentNeeded.push(contentList[i])
            cols(contentList[i])
        }
    }); 
}

// Targets heading div to creating the 1st row(Column names)

function colHeading(heading: string) {
    if (heading == "ID") {
        // console.log("heading", );
        let headingCol = `<div id="col_heading" class="col_heading">${heading}<input placeholder="Press Enter to search" id="idInput"></div>`;
        headings.innerHTML += headingCol;
    }
    else {
        let headingCol = `<div id="col_heading" class="col_heading">${heading}</div>`;
        headings.innerHTML += headingCol;
    }
}

// Display the current shown results

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

// Load all intial fields/data

window.onload = function() {
    stats()
    getColumns()
    getTable()
}

// Targets content div to create the actual table and fill with data

function cols(content: string) {
    let content_col = `<div id="content_col" class="content_col">
                        <div class="info" id="info_id">${content[0]}</div>
                        <div class="info">${content[1]}</div>
                        <div class="info">${content[2]}</div>
                        <div class="info">${content[3]}</div>
                        <div class="info">${content[4]}</div>
                        <div class="info">${content[5]}</div>
                        <div class="info">${content[6]}</div>
                        <div class="info">${content[7]}</div>
                        <div class="info">${content[8]}</div>
                        <div class="info">${content[9]}</div>
                        <div class="info">${content[10]}</div>
                        </div>`;
    content_cols.innerHTML += content_col
}

// Nav Buttons

//// Next Function

function next() {
    if (paramTwo < 999999) {
        disableNext()
        paramOne = paramOne + 10
        paramTwo = paramTwo + 10
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
        setTimeout(enableNext, 500)
    } else {
        alert("There are no more records")
    }
}

//// Prev Function

function prev() {
    if (paramOne >= 10) {
        disablePrev()
        paramOne = paramOne - 10
        paramTwo = paramTwo - 10
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
            // console.log(contentList);
            for (let i = 0; i < contentList.length; i++) {
                // console.log(contentList[i]);
                contentNeeded.push(contentList[i])
                cols(contentList[i])
            }
        });
        setTimeout(enablePrev, 500)
    } else {
        alert("No previous records")
    }
}

// To disable button
function disablePrev() {
    prevButton.disabled = true;
}
function disableNext() {
    nextButton.disabled = true;
}

// To Enable Buttons
function enablePrev() {
    prevButton.disabled = false;
}
function enableNext() {
    nextButton.disabled = false;
}

// Clear Table (content div)

function clearTable() {
    content_cols.innerHTML = clear
}

// ID Search

window.addEventListener("keydown", (e) => {
    let key = e.key;
    // console.log(key);

    if (key === "Enter") {
        let search: any = document.querySelector('#idInput');
        // console.log("searched for", search.value);
        clearTable()
        if (search.value != "" && search.value < 1000000) {
            pageStats.innerHTML = clear
            let searchStats = "Showing result with ID of " + search.value;
            pageStats.innerHTML = searchStats;
            fetch("http://localhost:2050/records?from=" + search.value + "&to=" + search.value, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
            .then((res) => res.text())
            .then((data) => {
                data = JSON.parse(data);
                let contentList = data;
                // console.log(contentList);
                for (let i = 0; i < contentList.length; i++) {
                    contentNeeded.push(contentList[i])
                    cols(contentList[i])
                }
            });
        } else {
            alert("There are no results with that ID!")
            stats()
            getTable()
        }
        search.value = clear
    }
})

// Jump to ID

// window.addEventListener("keydown", (e) => {
//     let key = e.key;
//     if (key === "Alt") {
//         let search: any = document.querySelector('#idJump');
//         let searchOne = search.value
//         let convert = parseInt(searchOne) + 9
//         let searchTwo = convert.toString()

//         if (searchOne != "" && searchOne <= 999990) {
//             clearTable()
//             fetch("http://localhost:2050/records?from=" + searchOne + "&to=" + searchTwo, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             })
//             .then((res) => res.text())
//             .then((data) => {
//                 data = JSON.parse(data);
//                 let contentList = data;
//                 // console.log(contentList);
//                 for (let i = 0; i < contentList.length; i++) {
//                     contentNeeded.push(contentList[i])
//                     cols(contentList[i])
//                 }
//             });
//             fetch("http://localhost:2050/recordCount", {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             })
//             .then((res) => res.text())
//             .then((data) => {
//                 data = JSON.parse(data);
//                 let count = data;
//                 let currentStats = "Showing results from ID " + searchOne + " to " + searchTwo + " out of " + count + " results.";
//                 pageStats.innerHTML = currentStats;
//             })
//         } else if (searchOne > 999990 && searchOne < 1000000) {
//             clearTable()
//             fetch("http://localhost:2050/records?from=" + searchOne + "&to=" + 999999, {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             })
//             .then((res) => res.text())
//             .then((data) => {
//                 data = JSON.parse(data);
//                 let contentList = data;
//                 // console.log(contentList);
//                 for (let i = 0; i < contentList.length; i++) {
//                     contentNeeded.push(contentList[i])
//                     cols(contentList[i])
//                 }
//             });
//             fetch("http://localhost:2050/recordCount", {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             })
//             .then((res) => res.text())
//             .then((data) => {
//                 data = JSON.parse(data);
//                 let count = data;
//                 let currentStats = "Showing results from ID " + searchOne + " to " + 999999 + " out of " + count + " results.";
//                 pageStats.innerHTML = currentStats;
//             })
//         } else {
//             alert("There are no records with that ID!")
//             clearTable()
//             stats()
//             getTable()
//         }
//         search.value = clear
//     }
// })

function idJump() {
    let search: any = document.querySelector('#idJump');
    let searchOne = search.value
    let convert = parseInt(searchOne) + 9
    let searchTwo = convert.toString()

    if (searchOne != "" && searchOne <= 999990) {
        clearTable()
        fetch("http://localhost:2050/records?from=" + searchOne + "&to=" + searchTwo, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            // console.log(contentList);
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
            let currentStats = "Showing results from ID " + searchOne + " to " + searchTwo + " out of " + count + " results.";
            pageStats.innerHTML = currentStats;
        })
    } else if (searchOne > 999990 && searchOne < 1000000) {
        clearTable()
        fetch("http://localhost:2050/records?from=" + searchOne + "&to=" + 999999, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => res.text())
        .then((data) => {
            data = JSON.parse(data);
            let contentList = data;
            // console.log(contentList);
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
        alert("There are no records with that ID!")
        clearTable()
        stats()
        getTable()
    }
    search.value = clear
}