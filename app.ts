/// <reference path="./interfaces/has-format-method.ts" />
/// <reference path="./classes/table-heading-string.ts" />
/// <reference path="./classes/render-table-headings.ts" />
/// <reference path="./classes/render-table-rows.ts" />
/// <reference path="./classes/get-column-headings.ts" />

// Global variable
let timeOut: ReturnType<typeof setTimeout>;

/**
   * This event executes two funtions immediately after the page loads
   * @function HFM.getColumnHeadings This is a function that gets the column headings from the back-end
   * @function getRecordCount() This is a function that gets the number of records in the back-end then runs a function to create the initial page
*/
window.onload = () => {
  HFM.getColumnsHeadings();
  getRecordCount();
};

/**
   * This event listens for the resizing of the window
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID and is used as the first parameter of getRecords function
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID and is used as the second parameter of getRecords function
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
window.addEventListener("resize", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;
  getRecords(Number(fromIDElement.innerHTML), Number(toIDElement.innerHTML), totalNumofRecords);
});

/**
   * This event listens for a click on the left arrow
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param numOfRows This parameter holds the value of the total number of rows required on a page
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID and is used as the first parameter of getRecords function
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID and is used as the second parameter of getRecords function
   * @param fromID This parameter holds the value in fromIDElement parameter as a type Number
   * @param toID This parameter holds the value in toIDElement parameter as a type Number
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
$("#leftarrow").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fromIDElement.innerHTML);
  let toID = Number(toIDElement.innerHTML);

  if ((fromID < numOfRows && fromID > 0) || fromID === 0) {
    fromID = 0;
    toID = numOfRows - 1;
  } else {
    fromID = fromID - (numOfRows - 1);
    toID = toID - (numOfRows - 1);
  }

  getRecords(fromID, toID, totalNumofRecords);
});

/**
   * This event listens for a click on the right arrow
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param numOfRows This parameter holds the value of the total number of rows required on a page
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID and is used as the first parameter of getRecords function
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID and is used as the second parameter of getRecords function
   * @param fromID This parameter holds the value in fromIDElement parameter as a type Number
   * @param toID This parameter holds the value in toIDElement parameter as a type Number
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
$("#rightarrow").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fromIDElement.innerHTML);
  let toID = Number(toIDElement.innerHTML);

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

/**
   * This event listens for a click on the submit button in the form
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param numOfRows This parameter holds the value of the total number of rows required on a page
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID
   * @param fromID This parameter holds the value in fromIDElement parameter as a type Number and is used as the first parameter of getRecords function
   * @param toID This parameter holds the value in toIDElement parameter as a type Number and is used as the second parameter of getRecords function
   * @param startFromIDElement This parameter holds the HTML paragraph element with ID #startFromIDElement
   * @param startFrom This parameter holds the value in startFromIDElement parameter as a type Number and used to set the starting ID for getting list of records
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
$("#submit").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;
  let fromID = Number(fromIDElement.innerHTML);
  let toID = Number(toIDElement.innerHTML);

  let startFromIDElement = document.querySelector("#startfrom"
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

/**
   * This event listens for a click on the 'Go to Start' button to go to the beginning of the data-set
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param numOfRows This parameter holds the value of the total number of rows required on a page
   * @param fromID This parameter holds the value 0 and is used as the first parameter of getRecords function
   * @param toID This parameter holds the value of numOfRows and is used as the second parameter of getRecords function
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
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

/**
   * This event listens for a click on the 'Go to End' button to go to the end of the data-set
   * @function clearTimeout This function clears the setTimeout global variable
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @param totalNumofRecords This parameter holds the value of the innerHTML and converts it to a Number type
   * @param numOfRows This parameter holds the value of the total number of rows required on a page
   * @param fromID This parameter holds the value ID that starts the last page of the dataset and is used as the first parameter of getRecords function
   * @param toID This parameter holds the value of totalNumofRecords and is used as the second parameter of getRecords function
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
$("#gotoend").on("click", () => {
  clearTimeout(timeOut);

  let numofrecords = document.querySelector(
    "#numofrecords"
  ) as HTMLParagraphElement;
  let totalNumofRecords = Number(numofrecords.innerHTML) - 1;
  let numOfRows = getNumOfRows();

  let fromID = totalNumofRecords - (numOfRows - 1);
  let toID = totalNumofRecords;

  getRecords(fromID, toID, totalNumofRecords);
});

/**
   * This function is used to create the initial page of the data
   * @function clearTimeout This function clears the setTimeout global variable
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID
   * @param fromID This parameter holds the value in fromIDElement parameter as a type Number and is used as the first parameter of getRecords function
   * @param toID This parameter holds the value in toIDElement parameter as a type Number and is used as the second parameter of getRecords function
   * @param numOfRows This parameter holds the value of the total number of rows required on a page and is the first parameter in the createInitialPage function
   * @param totalNumofRecords This parameter is the total number of records in the back-end and is the second parameter in the createInitialPage function
   * @function getRecords This function is used to get all the records withing the ID parameters specified
*/
function createInitialPage(numOfRows: number, totalNumofRecords: number) {
  clearTimeout(timeOut);

  let fromIDElement = document.querySelector("#fromID") as HTMLParagraphElement;
  let toIDElement = document.querySelector("#toID") as HTMLParagraphElement;

  let fromID = Number(fromIDElement.innerHTML);
  let toID = Number(toIDElement.innerHTML);

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

/**
   * This function is used to return the number of rows required to fill the window
   * @return This returns the calculated number of rows required on the current window size
*/
function getNumOfRows() {
  return Math.round(window.innerHeight / 33);
}

/**
   * This function is used to get the records to fill the window and present them in the browser
   * @param numOfRows This parameter holds the value of the total number of rows required on a page and is the first parameter in the getRecords function
   * @param fromIDElement This parameter holds the HTML paragraph element with ID #fromID
   * @param toIDElement This parameter holds the HTML paragraph element with ID #toID
   * @param fromID This parameter holds the value in fromIDElement parameter as a type Number and is used as the first parameter of clickTimeout function
   * @param toID This parameter holds the value in toIDElement parameter as a type Number and is used as the second parameter of clickTimeout function
   * @param totalNumofRecords This parameter is the total number of records in the back-end and is the second parameter in the getRecords function
   * @function clickTimeout This function creates a setTimeout which collects data from the back-end and presents it in the front-end
*/
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

/**
   * This function is used to get the total number of records in the back-end and to create the initial page of the data-set
   * @param numofrecords This parameter holds the HTML paragraph element with ID #numofrecords
   * @function getNumOfRows This function gets the number of rows required on the current window and is the first parameter in the createInitial Page function
   * @param totalNumofRecords This parameter is the total number of records in the back-end and is the second parameter in the createInitialPage function
   * @function createInitialPage This function creates a setTimeout which collects data from the back-end and presents it in the front-end
*/
function getRecordCount() {
  fetch("/recordCount")
    .then((res) => res.text())
    .then((value) => {
      let numofrecords = document.querySelector(
        "#numofrecords"
      ) as HTMLParagraphElement;
      numofrecords.innerHTML = value;
      let totalNumofRecords = Number(value) - 1;
      createInitialPage(getNumOfRows(), totalNumofRecords);
    })
    .catch((err) => console.log(err));
}

/**
   * This function creates the setTimeout for fetching the records from the back-end and renders the data to the front-end
   * @param timeOut This parameter holds the setTimeout to be created and is a global variable
   * @param startfrom This parameter holds the HTML input element at ID #startfrom in the form
   * @param fromID This parameter is the start ID value of the data to be fetched and is the first parameter of the clickTimeout function 
   * @param toID This parameter is the end ID value of the data to be fetched and is the second parameter of the clickTimeout function 
   * @param emptyTable This parameter holds the HTML DIV element with ID #records and is used to clear the records table when fetching new records
   * @method HFM.RenderTableRows is a method of type interface that renders the records to the HTML DOM 
   * @return This returns the timeout with the records to be fetched 
*/
function clickTimeout(fromID: number, toID: number) {
  timeOut = setTimeout(() => {
    let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
    startfrom.value = "";

    fetch("/records?from=" + fromID + "&to=" + toID)
      .then((res) => res.text())
      .then((recordsStr) => {
        let emptyTable = document.querySelector("#records") as HTMLDivElement;
        emptyTable.innerHTML = "";

        new HFM.RenderTableRows(recordsStr);
      })
      .catch((err) => console.log(err));
  }, 200);
  return timeOut;
}
