// Function To Get Number Of Rows That Can Be Displayed While Still Being Readable

const getNoOfRows = () => {
  const height = window.innerHeight;

  let number = height / 40;
  let noOfRows = Math.floor(number);
  return noOfRows;
};

// Variables

let paramOne = 0;
let paramTwo = paramOne + getNoOfRows();

//// Functions To Create/Clear The HTML

// Heading Row

const createHeadingRow = (headingData: string) => {
  const heading: any = document.querySelector("#heading");

  let headings = `<div class="headings" id="headings">${headingData}</div>`;
  heading.innerHTML += headings;
};

// Table Content

const createTableContent = (contentData: string) => {
  const content: any = document.querySelector("#content");

  let table = `<div id="row-${contentData[0]}" class="rows"></div>`;
  content.innerHTML += table;

  let rows: any = document.querySelector("#row-" + contentData[0] + ".rows");
  for (let x = 0; x < contentData.length; x++) {
    let rowCols = `<div class="row_cols">${contentData[x]}</div>`;
    rows.innerHTML += rowCols;
  }
};

// Clear Table Content

const clearTable = () => {
  const content: any = document.querySelector("#content");
  const clear = "";

  content.innerHTML = clear;
};

//// Fetch Requests

// Heading Row (Getting the columns data)

const getHeadings = () => {
  try {
    fetch("http://localhost:2050/columns", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((data) => {
        data = JSON.parse(data);
        let headingData = data;
        for (let i = 0; i < headingData.length; i++) {
          createHeadingRow(headingData[i]);
        }
      });
  } catch (error) {
    console.log(error);
  }
};

// Table Content (Getting the table's data)

const getTable = () => {
  try {
    fetch("http://localhost:2050/records?from=" + paramOne + "&to=" + paramTwo, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((data) => {
        data = JSON.parse(data);
        let contentData = data;
        for (let i = 0; i < contentData.length; i++) {
          createTableContent(contentData[i]);
        }
      });
  } catch (error) {
    console.log(error);
  }
};

// Displays The Current Results Being Shown

const stats = () => {
  const pageStats: any = document.querySelector("#pageStats");

  try {
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
      });
  } catch (error) {}
};

//// Debounce

const debounce = (fn: any, delay: number) => {
  let timer: number;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay);
  };
};

//// Sizing And Resizing

let resizing = () => {
  let end = paramOne + getNoOfRows();

  if (end > 999999) {
    paramTwo = 999999;
    paramOne = paramTwo - getNoOfRows();
  } else {
    paramOne;
    paramTwo = paramOne + getNoOfRows();
  }
  clearTable();
  getTable();
  stats();
};

resizing = debounce(resizing, 500);

window.addEventListener("resize", resizing);

//// On Window Load

window.onload = function () {
  getHeadings();
  getTable();
  stats();
};

//// Navigation

// Next
const nextButton: any = document.querySelector("#next");
let nextCount = 0;

const nextDebounce = (fn: any, delay: number) => {
  let timer: any;
  return function () {
    nextCount++;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay);
  };
};

let next = () => {
  if (paramTwo === 999999) {
    alert("You have reached the final page");
  }

  let nextAmount = paramTwo - paramOne + 1;
  let nextCountAmount = nextAmount * nextCount;
  paramOne = paramOne + nextCountAmount;
  paramTwo = paramOne + getNoOfRows();

  let end = paramOne + getNoOfRows();

  if (end > 999999) {
    paramTwo = 999999;
    paramOne = paramTwo - getNoOfRows();
  }

  nextCount = 0;

  clearTable();
  getTable();
  stats();
};

next = nextDebounce(next, 500);

nextButton.addEventListener("click", next);

// Previous
const prevButton: any = document.querySelector("#prev");
let prevCount = 0;

const prevDebounce = (fn: any, delay: number) => {
  let timer: any;
  return function () {
    prevCount++;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay);
  };
};

let prev = () => {
  if (paramOne === 0) {
    alert("You Are On The First Page");
  } else {
    let prevAmount = paramTwo - paramOne + 1;
    let prevCountAmount = prevAmount * prevCount;

    let intOne = paramOne - prevCountAmount;

    if (intOne < 0) {
      paramOne = 0;
    } else {
      paramOne = intOne;
    }

    paramTwo = paramOne + getNoOfRows();

    prevCount = 0;

    clearTable();
    getTable();
    stats();
  }
};

prev = prevDebounce(prev, 500);

prevButton.addEventListener("click", prev);

// ID Jump
const input: any = document.querySelector("input");

let idJump = () => {
  let currentID = paramOne;
  let search = input.value;
  let end = parseInt(search) + getNoOfRows();

  if (search !== NaN && search !== "" && search < 1000000 && search >= 0) {
    if (end > 999999) {
      paramTwo = 999999;
      paramOne = paramTwo - getNoOfRows();
    } else {
      paramOne = parseInt(search);
      paramTwo = paramOne + getNoOfRows();
    }
  } else if (search === "") {
    //pass
  } else {
    alert("Make Sure Your Desired ID Is Not A Negative Number Or Doesn't Exceed 999999");
    paramOne = currentID;
    paramTwo = paramOne + getNoOfRows();
    input.value = "";
  }

  clearTable();
  stats();
  getTable();
};

idJump = debounce(idJump, 500);

window.addEventListener("input", idJump);
