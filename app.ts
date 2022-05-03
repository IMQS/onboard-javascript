let fromParameter = 0;

function getParameters(fromParameter: number) {
  let toParameter: number;
  const height = window.innerHeight;

  let noOfRows = Math.floor(height / 40);
  toParameter = fromParameter + noOfRows;

  return toParameter;
}

const getNoOfRows = () => {
  const height = window.innerHeight;

  let number = height / 40;
  let noOfRows = Math.floor(number);
  return noOfRows;
};

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
  fetch("http://localhost:2050/columns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.text())
    .then((data) => {
      let headingData = JSON.parse(data);
      for (let i = 0; i < headingData.length; i++) {
        createHeadingRow(headingData[i]);
      }
      getParameters((fromParameter = 0));
    })
    .catch((error) => {
      console.log("Call Hector", error);
    });
};

// Table Content (Getting the table's data)

const getTable = () => {
  let toParameter = getParameters(fromParameter);

  fetch(`http://localhost:2050/records?from=${fromParameter}&to=${toParameter}`, {
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
};

// Displays The Current Results Being Shown

const stats = () => {
  const pageStats: any = document.querySelector("#pageStats");
  let toParameter = getParameters(fromParameter);

  let currentStats = `Showing results from ${fromParameter} to ${toParameter} out of 1 000 000 results.`;
  pageStats.innerHTML = currentStats;
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
  let end = fromParameter + getNoOfRows();
  let toParameter: number;

  if (end > 999999) {
    toParameter = 999999;
    fromParameter = toParameter - getNoOfRows();
  } else {
    toParameter = fromParameter + getNoOfRows();
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
  let toParameter = getParameters(fromParameter);

  if (toParameter === 999999) {
    alert("You have reached the final page");
  }

  let nextAmount = toParameter - fromParameter + 1;
  let nextCountAmount = nextAmount * nextCount;
  fromParameter = fromParameter + nextCountAmount;
  toParameter = fromParameter + getNoOfRows();

  let end = fromParameter + getNoOfRows();

  if (end > 999999) {
    toParameter = 999999;
    fromParameter = toParameter - getNoOfRows();
  }

  nextCount = 0;

  clearTable();
  getTable();
  stats();
};

nextButton.addEventListener("click", nextDebounce(next, 500));

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

    toParameter = fromParameter + getNoOfRows();

    prevCount = 0;

    clearTable();
    getTable();
    stats();
  }
};

prevButton.addEventListener("click", prevDebounce(prev, 500));

// ID Jump
const input: any = document.querySelector("input");
let toParameter = getParameters(fromParameter);

let idJump = () => {
  let currentID = fromParameter;
  let search = input.value;
  let end = parseInt(search) + getNoOfRows();

  if (search !== NaN && search !== "" && search < 1000000 && search >= 0) {
    if (end > 999999) {
      toParameter = 999999;
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
  } else {
    //pass
  }

  clearTable();
  stats();
  getTable();
};

window.addEventListener("input", debounce(idJump, 500));
