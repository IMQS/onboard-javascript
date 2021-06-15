import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";
import { request } from './httprequests/httpreq.js';

// Variable for tracking click events
let clicked = false;

// Instantiate grid table to append innerHTML
let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

// Screen Size
let screenWidth = screen.width;
let screenHeight = screen.height;

// let numOfRows = 23;
let numOfRows = getNumOfRows();
let totalNumofRecords: number;

//Accessing form data from front end
let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;
let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;
let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;

// Initializing variables for first page of data
let fromID = 1;
let toID = numOfRows;
fromIDElement.innerHTML = fromID.toString();
toIDElement.innerHTML = toID.toString();

createInitialPage(numOfRows);

window.addEventListener('resize', function(event) {
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
							
	if (screenHeight >= 750) {
		numOfRows = 23;
	} else if ((screenHeight < 750) && (screenHeight >= 550)) {
		numOfRows = 18;
	} else if ((screenHeight < 550) && (screenHeight >= 265)) {
		numOfRows = 8;
	} else if (screenHeight < 265) {
		numOfRows = 3;
	}

	createInitialPage(numOfRows);
});

// When clicking on left arrow
$( "#leftarrow" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if ((fromID < (numOfRows-1)) && (fromID > 1)) {
		fromID = 1;
		toID = numOfRows;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
		createTable(fromID, toID);
	} else if (fromID === 1) {
		// do nothing
	} else {
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
		createTable(fromID, toID);
	}
});
					
// Listen for click on right arrow
$( "#rightarrow" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if ((fromID > (totalNumofRecords-((numOfRows-1)*2)) ) && (fromID < totalNumofRecords) ) {
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
		createTable(fromID, toID);
	}  else if (toID === totalNumofRecords) {
		// do nothing
	} else {
		fromID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toID = toID + (numOfRows-1);
		toIDElement.innerHTML = toID.toString();
		createTable(fromID, toID);
	}
});
							
// Listen for submission in form and use inputs to request data from backend
$( "#submit" ).on( "click", function() {
	let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
	let startFrom = startFromIDElement.valueAsNumber;

	if (startFrom < 1 || startFrom > (totalNumofRecords-((numOfRows-1)*2))) {
		alert("The acceptable range is between 1 and "+(totalNumofRecords-((numOfRows-1))));
		return;
	}
	else {
		fromID = startFrom;
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	}

	createTable(fromID, toID);
});

// Listen for submission in form and use inputs to request data from backend
$( "#gotostart" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 1;
	toID = numOfRows;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	createTable(fromID, toID);
});


$( "#gotoend" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 999977;
	toID = totalNumofRecords;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	createTable(fromID, toID);
});

function createTable(fromID: number, toID: number) {
	// Fetch table headings from server
	request ("/columns", "GET", function(r: string) {
			let headingsStr: string;
			let recordsStr: string;
			try {
				headingsStr = r; 
				// Fetch records from server
				request( "/records?from="+fromID+"&to="+toID, "GET", function(r: string) {
						try {
							recordsStr = r; 
							generateTable(headingsStr, recordsStr); // call function to render table in browser
							clicked = false;
						} catch(err) {
							console.log(err);
							return;
						}
					}
				);
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
}

// Create table and render in browser
function generateTable(headingsStr: string, recordsStr: string) {
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; 
	let interfaceHeading: HasFormatMethod;							// variable of type interface used in creating table headings
	let interfaceRecords: HasFormatMethod;							// variable of type interface used in creating table rows
	interfaceHeading = new TableHeadingString(headingsStr);			// call method to generate string containing table heading element
	tble.constructTableHeadings(interfaceHeading);					// call method to render table headings element in browser
	interfaceRecords = new RenderTableRows(recordsStr);				// call method to generate string containing table row elements
}

function el(s: string) {
	return document.getElementById(s);
}

function createInitialPage(numOfRows: number) {
	fromID = 1;
	toID = numOfRows;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	//Request for total number of records
	request( "/recordCount", "GET", function(r: string) {
		try {
			numofrecords.innerHTML = r;
			totalNumofRecords = Number(r)-1;
		} catch(err) {
			console.log(err);
			return;
		}
	});

	// Render Initial Page of Data
	createTable(fromID, toID); // create table and render to browser.
}

function getNumOfRows() {
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight; 
							
	if (screenHeight >= 750) {
		return 23;
	} else if ((screenHeight < 750) && (screenHeight >= 550)) {
		return 18;
	} else if ((screenHeight < 550) && (screenHeight >= 265)) {
		return 8;
	} else if (screenHeight < 265) {
		return 3;
	} else {
		return 23;
	}
}