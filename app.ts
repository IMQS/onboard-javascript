let paramOne: any = 0
let paramTwo: any = 9
let contentNeeded: any = [];
let contentListNeeded: any = []
const headings: any = document.querySelector("#Headings");
const content_cols: any = document.querySelector("#Content");
const lists: any = document.querySelector('#info-id')
const pageStats: any = document.getElementById('pageStats')
const clear = "";
const prevButton: any = document.querySelector('#prev')
const nextButton: any = document.querySelector('#next')
let nextClickCount = 0;
let prevClickCount = 0;
let nextClicked: boolean
let prevClicked: boolean

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
        for (let i = 0; i < contentList.length; i++) {
            contentNeeded.push(contentList[i])
            cols(contentList[i])
            console.log(contentList[i]);
            let contentListContent: any = contentList[i]
            for (let j = 0; j < contentListContent.length; j++) {
                contentListNeeded.push(contentListContent[j]);
                colContent(contentListContent[j])
            }
        }
    }); 
}

// Targets heading div to creating the 1st row(Column names)

function colHeading(heading: string) {
    if (heading == "ID") {
        let headingCol = `<div id="col_heading" class="col_heading">${heading}<input placeholder="Press Enter to search" id="idInput"></div>`;
        headings.innerHTML += headingCol;
    }
    else {
        let headingCol = `<div id="col_heading" class="col_heading">${heading}</div>`;
        headings.innerHTML += headingCol;
    }
}

function colContent(list: string) {
    let contentCol = `<div id="col_heading" class="col_heading">${list}</div>`;
    lists.innerHTML += contentCol
}

// Targets content div to create the actual table and fill with data

function cols(content: string) {
    let content_col = `<div id="content_col" class="content_col">
                        <div class="info" id="info_id">${content}</div>
                        </div>`;
    content_cols.innerHTML += content_col
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


// Nav Buttons

//// Next Function

function next() {
    if (paramTwo < 999999) {
        disableNext()

        let intOne = parseInt(paramOne) + 10
        let intTwo = parseInt(paramTwo) + 10
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
        setTimeout(enableNext, 500)
    } else {
        disableNext()
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
        setTimeout(enableNext, 500)
    }
}

//// Prev Function

function prev() {
    if (paramOne >= 10) {
        disablePrev()

        let intOne = parseInt(paramOne) - 10
        let intTwo = parseInt(paramTwo) - 10
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
        setTimeout(enablePrev, 500)
    } else {
        disablePrev()
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
        setTimeout(enablePrev, 500)
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

    if (key === "Enter") {
        let search: any = document.querySelector('#idInput');
        clearTable()
        if (search.value != "" && search.value < 1000000 && search.value >= 0) {
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

// nextButton.addEventListener("click", function() {
//     let current = new Date()
//     let firstHour = current.getHours();
//     let firstMinute = current.getMinutes();
//     let firstSecond = current.getSeconds();
//     console.log("test");
    

//     if (firstSecond > 57) {
//         let currentSecs = current.getSeconds()
//         if (currentSecs <= firstSecond + 3 ) {
//             console.log("Works");
//         }
//     } 
// })

