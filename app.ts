const headings: any = document.querySelector("#Headings");
const content_cols: any = document.querySelector("#Content");
const pageStats: any = document.getElementById('pageStats')
const nextButton: any = document.querySelector("#next");
const prevButton: any = document.querySelector("#prev");
const clear = "";
let paramOne: any = "0"
let paramTwo: any = "9"
let contentNeeded: any = [];

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
    let windowHeight = window.innerHeight;

    if (windowHeight < 600 && windowHeight >= 480) {
        paramOne = paramOne
        paramTwo = parseInt(paramOne) + 6
        paramTwo = paramTwo.toString()
        stats()
        getColumns()
        getTable()
    } else if (windowHeight < 480 && windowHeight >= 400) {
        paramOne = paramOne
        paramTwo = parseInt(paramOne) + 4
        paramTwo = paramTwo.toString()
        stats()
        getColumns()
        getTable()
    } else if (windowHeight < 400 && windowHeight > 300) {
        paramOne = paramOne
        paramTwo = parseInt(paramOne) + 2
        paramTwo = paramTwo.toString()
        stats()
        getColumns()
        getTable()
    } else if (windowHeight <= 300) {
        paramOne = paramOne
        paramTwo = parseInt(paramOne) + 1
        paramTwo = paramTwo.toString()
        stats()
        getColumns()
        getTable()
    } else {
        stats()
        getColumns()
        getTable()
    }
}

// Displaying data into html

//// Targets heading div to creating the 1st row(Column names)

function colHeading(heading: string) {
    let headingCol = `<div id="col_heading" class="col_heading">${heading}</div>`;
    headings.innerHTML += headingCol;
}

//// Targets content div to create the actual table and fill with data


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

// Jump to ID  

function idJump() {
    let windowHeight = window.innerHeight;
    let toConvert: any;

    if (windowHeight < 600 && windowHeight >= 480) {
        toConvert = 6
    }
    else if (windowHeight < 480 && windowHeight >= 400) {
        toConvert = 4
    }
    else if (windowHeight < 400 && windowHeight > 300) {
        toConvert = 2
    }
    else if (windowHeight <= 300) {
        toConvert = 1
    }
    else {
        toConvert = 9
    }

    let search: any = document.querySelector('#idJump');
    let searchOne = search.value
    let convert = parseInt(searchOne) + toConvert
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
    } 
    else if ( searchOne > 999990 && searchOne < 1000000 && searchOne >= 0 && searchOne !== 'e') {
        clearTable()
        let lastParamOne = 999999 - toConvert

        fetch("http://localhost:2050/records?from=" + lastParamOne + "&to=" + 999999, {
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
            let currentStats = "Showing results from ID " + lastParamOne + " to " + 999999 + " out of " + count + " results.";
            pageStats.innerHTML = currentStats;
        })
    }
     else {
        alert("There are no records with that ID! Please check that your input does not exceed 999 999 and is not a negative amount.")
    }
    search.value = clear
}

// Nav Buttons

//// Next Function

const nextDebounce = (fn: any, delay: any) => {
    let timer: any;
    return function() {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn()
        }, delay)
    }
}

let next = () => {
    
    if (paramTwo == 999999) {
        alert("You have reached the final page")
    } else {
        let nextAmount: any = (paramTwo - paramOne) + 1
        
        let intOne = parseInt(paramOne) + nextAmount
        let intTwo = parseInt(paramTwo) + nextAmount
        paramOne = intOne.toString()
        paramTwo = intTwo.toString()

        resizing()
    }
}

next = nextDebounce(next, 500)

nextButton.addEventListener("click", next)

//// Prev Function

const prevDebounce = (fn: any, delay: any) => {
    let timer: any;
    return function() {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn()
        }, delay)
    }
}

let prev = () => {
    let windowHeight = window.innerHeight;

    if (windowHeight < 600 && windowHeight >= 480) {
        if (paramOne <= 6) {
            paramOne = 0
            alert("This is the first page")
        } else {
            let prevAmount: any = (paramTwo - paramOne) + 1
    
            let intOne = parseInt(paramOne) - prevAmount
            let intTwo = parseInt(paramTwo) - prevAmount
            paramOne = intOne.toString()
            paramTwo = intTwo.toString()
    
            prevRe()
        }
    } 
    else if (windowHeight < 480 && windowHeight >= 400) {
        if (paramOne <= 4) {
            paramOne = 0
            alert("This is the first page")
        } else {
            let prevAmount: any = (paramTwo - paramOne) + 1
    
            let intOne = parseInt(paramOne) - prevAmount
            let intTwo = parseInt(paramTwo) - prevAmount
            paramOne = intOne.toString()
            paramTwo = intTwo.toString()
    
            prevRe()
        }
    }
    else if (windowHeight < 400 && windowHeight > 300) {
        if (paramOne <= 2) {
            paramOne = 0
            alert("This is the first page")
        } else {
            let prevAmount: any = (paramTwo - paramOne) + 1
    
            let intOne = parseInt(paramOne) - prevAmount
            let intTwo = parseInt(paramTwo) - prevAmount
            paramOne = intOne.toString()
            paramTwo = intTwo.toString()
    
            prevRe()
        }
    }
    else if (windowHeight <= 300) {
        if (paramOne <= 1) {
            paramOne = 0
            alert("This is the first page")
        } else {
            let prevAmount: any = (paramTwo - paramOne) + 1
    
            let intOne = parseInt(paramOne) - prevAmount
            let intTwo = parseInt(paramTwo) - prevAmount
            paramOne = intOne.toString()
            paramTwo = intTwo.toString()
    
            prevRe()
        }
    }
    else {
        if (paramOne <= 9) {
            paramOne = 0
            alert("This is the first page")
        } else {
            let prevAmount: any = (paramTwo - paramOne) + 1
    
            let intOne = parseInt(paramOne) - prevAmount
            let intTwo = parseInt(paramTwo) - prevAmount
            paramOne = intOne.toString()
            paramTwo = intTwo.toString()
    
            prevRe()
        }
    }

}

prev = prevDebounce(prev, 500)

prevButton.addEventListener("click", prev)


// Resizing 

let count = 0;

const debounce = (fn: any, delay: any) => {
    let timer: any;
    return function() {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn()
        }, delay)
    }
}

let resizing = () => {
    let windowHeight = window.innerHeight;

    if (windowHeight < 600 && windowHeight >= 480) {
        if (paramOne > 999993) {
            paramOne = 999993
        } else {
            //pass
        }
        paramTwo = parseInt(paramOne) + 6
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight < 480 && windowHeight >= 400) {
        if (paramOne > 999995) {
            paramOne = 999995
        } else {
            //pass
        }
        paramTwo = parseInt(paramOne) + 4
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight < 400 && windowHeight > 300) {
        if (paramOne > 999997) {
            paramOne = 999997
        } else {
            //pass
        }
        paramTwo = parseInt(paramOne) + 2
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight <= 300) {
        if (paramOne > 999998) {
            paramOne = 999998
        } else {
            //pass
        }
        paramTwo = parseInt(paramOne) + 1
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    }
    else {
        if (paramOne > 999990) {
            paramOne = 999990
        } else {
            //pass
        }
        
        paramTwo = parseInt(paramOne) + 9
        
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    }
}

resizing = debounce(resizing, 500)

window.addEventListener("resize", resizing)


function prevRe() {
    let windowHeight = window.innerHeight;

    if (windowHeight < 600 && windowHeight >= 480) {
        paramTwo = parseInt(paramOne) + 6
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight < 480 && windowHeight >= 400) {
        paramTwo = parseInt(paramOne) + 4
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight < 400 && windowHeight > 300) {
        paramTwo = parseInt(paramOne) + 2
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    } 
    else if (windowHeight <= 300) {
        paramTwo = parseInt(paramOne) + 1
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    }
    else {
        paramTwo = parseInt(paramOne) + 9
        paramTwo = paramTwo.toString()
        clearTable()
        stats()
        getTable()
    }
}