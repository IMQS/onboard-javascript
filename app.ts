// Get the container from the html where the data will be stored
let recordNav: any = document.querySelector("#record-navigation-container"); //Navigation area;
let headingColumns: any = document.querySelector("#column-headings-container"); //Headings;
let infoColumns: any = document.querySelector("#info-columns-container"); //Information;

function createNavigation() {
  recordNav.innerHTML = `
  <div class="next-previous-navigation">
  <div class="next-previous-navigation-btns">
    <button class="previous-records-btn">Previous</button>
    <button class="next-records-btn">Next</button>
  </div>
</div>
<div class="current-page-container">
<p class=current-page></p>
</div>
<div class="select-confirm">
  <select name="record-selection" id="record-selection">
    <option value="multiple">Multiple Records</option>
    <option value="multiple-single">Multiple Single Records</option>
  </select>
  <button onclick="recordSelection()" id="confirmation-btn">
    Confirm Selection
  </button>
</div>
  `;
}

function createGrid(headingList: any, rowList: string) {
  let amountOfHeadingColumns: number = headingList.length;
  let amountOfDataColumns: number = rowList.length;
  // console.log(rowList[0], amountOfDataColumns);

  for (let i = 0; i < amountOfHeadingColumns; i++) {
    let headingColumn: any = `<p class="column-heading">${headingList[i]}</p>`;
    headingColumns.innerHTML += headingColumn;
  }

  for (let i = 0, x = 0; i < 15 && x < amountOfDataColumns; i++ && x++) {
    console.log(rowList[i]);
    console.log(rowList[i][x]);
    let id = rowList[i];

    console.log(rowList);

    // let infoRow: any = `
    //   <div class="info-row">
    //   ${rowList[i][x]}
    //   </div>`;
    // infoColumns.innerHTML += infoRow;
    break;
  }
}

function fetchData() {
  // Gets headings array
  fetch("http://localhost:2050/columns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.text())
    .then((data) => {
      let headingDataList = JSON.parse(data);

      // Fetching information
      fetch("http://localhost:2050/records?from=0&to=16", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.text())
        .then((data) => {
          let columnDataList = JSON.parse(data);
          createGrid(headingDataList, columnDataList);
        });
    });
  createNavigation();
}

fetchData();

function nextPrevious(firstId: any, finalId: any) {
  let nextBtn: any = document.querySelector(".next-records-btn");
  let previousBtn: any = document.querySelector(".previous-records-btn");
  let currentPage: any = document.querySelector(".current-page");

  let numberOne: number = firstId;
  let numberTwo: number = finalId;

  currentPage.innerHTML = numberOne + " -> " + numberTwo;

  if (numberOne === 0 && numberTwo === 15) {
    previousBtn.style.display = "none";
  } else {
    //pass
  }

  nextBtn.addEventListener("click", () => {
    console.log("next");
    const amountRecords: number = 16;
    let nextNumberOne: number = numberOne + amountRecords;
    let nextNumberTwo: number = numberTwo + amountRecords;

    if (nextNumberOne === 32 && nextNumberTwo === 47) {
      nextBtn.style.display = "none";
      currentPage.innerHTML = "";
      currentPage.innerHTML =
        nextNumberOne + " -> " + nextNumberTwo + " Final Page";
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
    }
  });

  previousBtn.addEventListener("click", () => {
    console.log("previous");

    const amountRecords: number = 15;
    let nextNumberOne: number = numberOne - amountRecords;
    let nextNumberTwo: number = numberTwo - amountRecords;

    if (numberOne === 0 && numberTwo === 15) {
      previousBtn.style.display = "none";
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
    } else {
      currentPage.innerHTML = "";
      currentPage.innerHTML = nextNumberOne + " -> " + nextNumberTwo;
      numberOne = nextNumberOne;
      numberTwo = nextNumberTwo;
    }
  });
}
nextPrevious(0, 15);

//

// function multipleSingularColumns(
//   info: string,
//   columnPostion: string,
//   idOfData: string
// ) {
//   let infoColumns: any = document.querySelector("#info-columns");
//   let infoRows = `
//     <div  class="info-row">
//       <div class="info-column">${info[0]}</div>
//       <div id="one" class="info-column certain-column${idOfData}">${info[1]}</div>
//       <div id="two" class="info-column certain-column${idOfData}">${info[2]}</div>
//       <div id="three" class="info-column certain-column${idOfData}">${info[3]}</div>
//       <div id="four" class="info-column certain-column${idOfData}">${info[4]}</div>
//       <div id="five" class="info-column certain-column${idOfData}">${info[5]}</div>
//       <div id="six" class="info-column certain-column${idOfData}">${info[6]}</div>
//       <div id="seven" class="info-column certain-column${idOfData}">${info[7]}</div>
//       <div id="eight" class="info-column certain-column${idOfData}">${info[8]}</div>
//       <div id="nine" class="info-column certain-column${idOfData}">${info[9]}</div>
//       <div id="ten" class="info-column certain-column${idOfData}">${info[10]}</div>
//     </div>`;

//   if (columnPostion === "a") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#one.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "b") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#two.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "c") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#three.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "d") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#four.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "e") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#five.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "f") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#six.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "g") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#seven.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "h") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#eight.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "i") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#nine.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else if (columnPostion === "j") {
//     infoColumns.innerHTML += infoRows;
//     let infoColumnTargeted: any = document.querySelector(
//       "#ten.certain-column" + idOfData
//     );
//     infoColumnTargeted.style.color = "red";
//   } else {
//     alert("Error");
//   }
// }

// Function that allows the user to filter between looking fo a singular record, multiple records or multiple singular records.

// function recordSelection() {
//   // let confirmationBtn: any = document.querySelector("#select-confirmation-btn") runs the function in the html (onclick);
//   // Accesses the area on the page where the select is shown.
//   let selectionArea: any = recordNav;
//   // Checks how you want filter records.
//   let recordSelector: any = document.querySelector("#record-selection");
//   let recordSelectionValue: string = recordSelector.value;
//   //
//   let records: any = [];

//   // Checks if the select gives a proper value.
//   if (
//     recordSelectionValue === "multiple" ||
//     recordSelectionValue === "multiple-single"
//   ) {
//     if (recordSelectionValue === "multiple") {
//       let multipleRecordSelection = `
//       <button id="multiple-return-btn" class="return-btn">Return</button>
//       <div id="user-input-data">
//       <div class="navigation-input-area">
//         <div class="navigation-input-area-id" id="from-id">
//           <label class="record-labels" for="record-id"
//             >Enter starting record ID :
//           </label>
//           <input
//             type="number"
//             min="0"
//             name="record-id"
//             id="from-record-id"
//             class="navigation-input"
//             value="0"
//           />
//         </div>
//         <div class="navigation-input-area-id" id="from-id">
//           <label class="record-labels" for="record-id"
//             >Enter stop record ID :
//           </label>
//           <input
//             type="number"
//             min="0"
//             name="record-id"
//             id="to-record-id"
//             class="navigation-input"
//             value="15"
//           />
//         </div>
//       </div>
//     </div>
//     <button id="multiple-submit-btn" class="submit-btn" >Get Records</button>
//       `;
//       selectionArea.innerHTML = "";
//       selectionArea.innerHTML = multipleRecordSelection;

//       let returnBtn: any = document.querySelector(
//         "#multiple-return-btn.return-btn"
//       );

//       returnBtn.addEventListener("click", () => {
//         records = [];
//         headingColumns.innerHTML = "";
//         infoColumns.innerHTML = "";
//         fetchData();
//         createNavigation();
//       });

//       let multipleSubmitBtn: any = document.querySelector(
//         "#multiple-submit-btn.submit-btn"
//       );
//       multipleSubmitBtn.addEventListener("click", () => {
//         let fromIdSelection: any = document.querySelector(
//           "#from-record-id.navigation-input"
//         );
//         let toIdSelection: any = document.querySelector(
//           "#to-record-id.navigation-input"
//         );

//         let fromIdValue = fromIdSelection.value;
//         let toIdValue = toIdSelection.value;

//         if (fromIdValue.length === 0 || toIdValue === 0) {
//           alert(
//             "You left one of the record id inputs empty or you have entered an incorrect character."
//           );
//         } else {
//           if (
//             (fromIdValue !== null && toIdValue !== null) ||
//             (fromIdValue !== "" && toIdValue !== "")
//           ) {
//             const totalRecordsAllowed = 16;
//             let recordCount: number =
//               Number(toIdValue) - Number(fromIdValue) + 1;
//             if (
//               recordCount > totalRecordsAllowed ||
//               typeof recordCount !== "number"
//             ) {
//               let excessRecords = recordCount - totalRecordsAllowed;
//               toIdValue = toIdValue - excessRecords;
//               alert(
//                 "The data you entered is incorrect or you trying to access to much records only " +
//                   totalRecordsAllowed +
//                   " records can be accessed at a time. You have " +
//                   excessRecords +
//                   " excess records"
//               );
//               // Fetching information
//               fetch(
//                 "http://localhost:2050/records?from=" +
//                   fromIdValue +
//                   "&to=" +
//                   toIdValue,
//                 {
//                   method: "GET",
//                   headers: { "Content-Type": "application/json" },
//                 }
//               )
//                 .then((response) => response.text())
//                 .then((data) => {
//                   let columnDataList = JSON.parse(data);

//                   infoColumns.innerHTML = "";
//                 });
//             } else if (recordCount <= 16 || typeof recordCount === "number") {
//               // Fetching information
//               fetch(
//                 "http://localhost:2050/records?from=" +
//                   fromIdValue +
//                   "&to=" +
//                   toIdValue,
//                 {
//                   method: "GET",
//                   headers: { "Content-Type": "application/json" },
//                 }
//               )
//                 .then((response) => response.text())
//                 .then((data) => {
//                   let columnDataList = JSON.parse(data);

//                   infoColumns.innerHTML = "";
//                   for (let i = 0; i < columnDataList.length; i++) {

//                   }
//                 });
//             }
//           } else {
//             alert(
//               "Sorry there has been a problem. Please check your inputs make sure you have both filled."
//             );
//           }
//         }
//       });
//     } else if (recordSelectionValue === "multiple-single") {
//       let multipleSingleRecordSelection = `
//       <button id="multiple-single-return-btn" class="return-btn">Return</button>
//       <div id="user-input-data">
//         <div class="navigation-input-area">
//           <div class="navigation-input-area-id" id="id">
//             <label class="record-labels" for="record-id"
//               >Enter record ID :
//             </label>
//             <input
//               type="number"
//               min="0"
//               name="record-id"
//               id="record-id"
//               class="navigation-input"
//               value="0"
//             />
//           </div>
//           <div id="multiple-single-selection" class="navigation-input-area-id">
//             <label class="record-labels" for="record-id"
//               >Enter record content letter (Optional) :
//             </label>
//             <select
//               name="record-content"
//               class="navigation-input"
//               id="record-content"
//             >
//               <option value="none">Select Letter</option>
//               <option value="a">A</option>
//               <option value="b">B</option>
//               <option value="c">C</option>
//               <option value="d">D</option>
//               <option value="e">E</option>
//               <option value="f">F</option>
//               <option value="g">G</option>
//               <option value="h">H</option>
//               <option value="i">I</option>
//               <option value="j">J</option>
//             </select>
//           </div>
//         </div>
//       </div>
//       <button id="add-records-btn" class="add-btn">See Records</button>
//       `;
//       selectionArea.innerHTML = "";
//       selectionArea.innerHTML = multipleSingleRecordSelection;
//       let returnBtn: any = document.querySelector(
//         "#multiple-single-return-btn.return-btn"
//       );
//       returnBtn.addEventListener("click", () => {
//         alert("Records you have viewed " + records);
//         headingColumns.innerHTML = "";
//         infoColumns.innerHTML = "";
//         fetchData();
//         createNavigation();
//       });
//       let addMulitpleSingularRecords: any = document.querySelector(
//         "#add-records-btn.add-btn"
//       );

//       addMulitpleSingularRecords.addEventListener("click", () => {
//         // Inputs and selects
//         let IdSelection: any = document.querySelector(
//           "#record-id.navigation-input"
//         );

//         let letterValueSelection: any =
//           document.querySelector("#record-content");

//         //Values Needed
//         let IdValue = IdSelection.value;
//         let letterValue = letterValueSelection.value;
//         let numberCheck: number = 12 - Number(IdValue);
//         const recordAmount: number = 16;
//         let amountOfRecords = records.length;

//         if (amountOfRecords > recordAmount) {
//           alert("That is the total amount of records that can be added");
//         } else if (amountOfRecords === 0) {
//           infoColumns.innerHTML = "";
//         } else {
//           //pass
//         }

//         if (IdValue.length === 0 || letterValue === "none") {
//           alert(
//             "You left one of the record id inputs empty or you have entered an incorrect character."
//           );
//         } else {
//           if (
//             typeof numberCheck === "number" &&
//             typeof letterValue === "string"
//           ) {
//             let record = {
//               Id: IdValue,
//               letterId: letterValue,
//             };
//             let arrayRecord = JSON.stringify(record);
//             let isInArray = records.includes(arrayRecord);

//             if (isInArray === false) {
//               // Fetching information
//               fetch(
//                 "http://localhost:2050/records?from=" +
//                   IdValue +
//                   "&to=" +
//                   IdValue,
//                 {
//                   method: "GET",
//                   headers: { "Content-Type": "application/json" },
//                 }
//               )
//                 .then((response) => response.text())
//                 .then((data) => {
//                   let columnDataList = JSON.parse(data);

//                   infoColumns.innerHTML += "";
//                   console.log(columnDataList);
//                 });
//               records.push(arrayRecord);

//               for (let i = 0; i < records.length; i++) {
//                 JSON.parse(records[i]);
//               }
//             } else {
//               alert("The record was already added");
//             }
//           } else {
//             alert("Enter apropriate inputs please");
//           }
//         }
//       });
//       records = records;
//     } else {
//       alert(
//         "Sorry there has been a problem. The page will reload can you please try again."
//       );
//       window.location.reload();
//     }
//   } else {
//     alert("Error");
//   }
// }
