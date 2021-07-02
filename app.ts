/// <reference path="./interfaces/has-format-method.ts" />
/// <reference path="./classes/table-heading-string.ts" />
/// <reference path="./classes/render-table-headings.ts" />
/// <reference path="./classes/render-table-rows.ts" />
/// <reference path="./classes/get-column-headings.ts" />

// Global variable
let timeOut: ReturnType<typeof setTimeout>;

// Run functions when window loads
window.onload = () => {
  HFM.getColumnsHeadings();
  getRecordCount();
};

// Listen for change in window size
window.addEventListener("resize", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;

  let fID = document.querySelector("#fromID") as HTMLParagraphElement;
  let tID = document.querySelector("#toID") as HTMLParagraphElement;
  getRecords(Number(fID.innerHTML), Number(tID.innerHTML), totalNumofRecords);
});

// Listen for clicks on left arrow
$("#leftarrow").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fID = document.querySelector("#fromID") as HTMLParagraphElement;
  let tID = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fID.innerHTML);
  let toID = Number(tID.innerHTML);

  if ((fromID < numOfRows && fromID > 0) || fromID === 0) {
    fromID = 0;
    toID = numOfRows - 1;
  } else {
    fromID = fromID - (numOfRows - 1);
    toID = toID - (numOfRows - 1);
  }

  getRecords(fromID, toID, totalNumofRecords);
});

// Listen for clicks on right arrow
$("#rightarrow").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fID = document.querySelector("#fromID") as HTMLParagraphElement;
  let tID = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fID.innerHTML);
  let toID = Number(tID.innerHTML);

  if (
    (fromID > totalNumofRecords - (numOfRows - 1) * 2 &&
      fromID < totalNumofRecords) ||
    toID === totalNumofRecords
  ) {
    fromID = totalNumofRecords - (numOfRows - 1);
    toID = totalNumofRecords;
  } else {
    fromID = fromID + (numOfRows - 1);
    toID = toID + (numOfRows - 1);
  }

  getRecords(fromID, toID, totalNumofRecords);
});

// Listen for submission in form and use inputs to request data from backend
$("#submit").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fID = document.querySelector("#fromID") as HTMLParagraphElement;
  let tID = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fID.innerHTML);
  let toID = Number(tID.innerHTML);

  let startFromIDElement = document.querySelector(
    "#startfrom"
  ) as HTMLInputElement;
  let startFrom = startFromIDElement.valueAsNumber;

  if (totalNumofRecords <= numOfRows) {
    alert("This page shows all the records available");
    return;
  } else {
    if (startFrom < 0 || startFrom > totalNumofRecords - (numOfRows - 1)) {
      alert(
        "The acceptable range is between 0 and " +
          (totalNumofRecords - (numOfRows - 1))
      );
      return;
    } else if (isNaN(startFrom)) {
      alert("You have not set a value to submit.");
      return;
    }
  }

  fromID = startFrom;
  toID = fromID + (numOfRows - 1);

  getRecords(fromID, toID, totalNumofRecords);
});

// Listen for click to go to start of data
$("#gotostart").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fromID = 0;
  let toID = numOfRows;

  getRecords(fromID, toID, totalNumofRecords);
});

// Listen for sclick to go to end of data
$("#gotoend").on("click", () => {
  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();
  clearTimeout(timeOut);

  let fromID = totalNumofRecords - (numOfRows - 1);
  let toID = totalNumofRecords;

  getRecords(fromID, toID, totalNumofRecords);
});

function createInitialPage(numOfRows: number, totalNumofRecords: number) {
  clearTimeout(timeOut);

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;

  let fID = document.querySelector("#fromID") as HTMLParagraphElement;
  let tID = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fID.innerHTML);
  let toID = Number(tID.innerHTML);

  if (totalNumofRecords <= numOfRows) {
    fromID = 0;
    toID = totalNumofRecords;
  } else if (fromID > totalNumofRecords - (numOfRows - 1)) {
    fromID = totalNumofRecords - (numOfRows - 1);
    toID = fromID + (numOfRows - 1);
  } else {
    fromID = fromID;
    toID = fromID + (numOfRows - 1);
  }

  fromIDElement.innerHTML = fromID.toString();
  toIDElement.innerHTML = toID.toString();

  getRecords(fromID, toID, totalNumofRecords);
}

function getNumOfRows() {
  return Math.round(window.innerHeight / 33);
}

function getRecords(fromID: number, toID: number, totalNumofRecords: number) {
  let numOfRows = getNumOfRows();
  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;

  if (totalNumofRecords <= numOfRows) {
    fromID = 0;
    toID = totalNumofRecords;
  } else {
    if (fromID > totalNumofRecords - (numOfRows - 1)) {
      fromID = totalNumofRecords - (numOfRows - 1);
      toID = fromID + (numOfRows - 1);
    } else {
      fromID = fromID;
      toID = fromID + (numOfRows - 1);
    }
  }

  fromIDElement.innerHTML = fromID.toString();
  toIDElement.innerHTML = toID.toString();

  if (fromID != 1 || toID != totalNumofRecords) {
    clearTimeout(timeOut);
  }

  clickTimeout(fromID, toID);
}

function getRecordCount() {
  fetch("/recordCount")
    .then((res) => res.text())
    .then((value) => {
      let numofrecords = document.querySelector(
        "#numofrecords"
      ) as HTMLParagraphElement;
      numofrecords.innerHTML = value;
      let t = Number(value) - 1;
      createInitialPage(getNumOfRows(), t);
    })
    .catch((err) => console.log(err));
}

function clickTimeout(fromID: number, toID: number) {
  timeOut = setTimeout(() => {
    let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
    startfrom.value = "";

    fetch("/records?from=" + fromID + "&to=" + toID)
      .then((res) => res.text())
      .then((recordsStr) => {
        let emptyTable = document.querySelector("#records") as HTMLDivElement;
        emptyTable.innerHTML = "";

        let interfaceRecords: HFM.RenderTableRows;

        new HFM.RenderTableRows(recordsStr);
      })
      .catch((err) => console.log(err));
  }, 200);
  return timeOut;
}
