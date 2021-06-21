import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";
import { request } from './httprequests/httpreq.js';

let numOfRows = getNumOfRows();		// Call function to get number of rows to render based on current screen size
let totalNumofRecords: number;		// Declare public variable to store total number of records from the server

// Accessing form data from front end
let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;
let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;
let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;

// Initializing variables for first page of data
let fromID = 1;
let toID = numOfRows;
fromIDElement.innerHTML = fromID.toString();
toIDElement.innerHTML = toID.toString();

// Create initial page with initial data
createInitialPage(numOfRows);

// Listen for change in window size
let screenHeight = screen.height;
window.addEventListener('resize', function(event) {
	screenHeight = window.innerHeight;	
	
	// Change number of rows based on window size
	if (screenHeight >= 750) {
		numOfRows = 23;
	} else if ((screenHeight < 750) && (screenHeight >= 550)) {
		numOfRows = 18;
	} else if ((screenHeight < 550) && (screenHeight >= 265)) {
		numOfRows = 8;
	} else if ((screenHeight < 265) && (screenHeight >= 95)) {
		numOfRows = 3;
	} else if (screenHeight < 95) {
		numOfRows = 2;
	}

	// Recreate grid with new set number of rows
	createInitialPage(numOfRows);
});

// Set a timeout to use for promises when navigating through data
let clickTimeout: ReturnType<typeof setTimeout>;

// When clicking on left arrow
$( "#leftarrow" ).on( "click", function() {
	// Clear the timeout every time if you navigate and you're not at the start ID of all the data
	if (fromID != 1) {
		clearTimeout(clickTimeout);
	}

	// Clear form value in front-end when navigating data using the arrows
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	
	if ((fromID < (numOfRows-1)) && (fromID > 1)) {		// If the "from" ID is within the IDs at the beginning of the dataset
		fromID = 1;
		toID = numOfRows;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		// Create table using the new set IDs inside a set timeout
		clickTimeout = setTimeout(function(){
			// Use resolved promises to fetch data from backend
			let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	} else if (fromID === 1) {							// If the "from" ID is 1 then set the values and do not make any backend calls
		fromID = 1;
		toID = numOfRows;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	} else {											// Else, continue creating table with the set IDs
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		// Create table using the new set IDs inside a set timeout
		clickTimeout = setTimeout(function(){
			// Use resolved promises to fetch data from backend
			let headings = Promise.resolve(fetch("/columns").then(res => res.text()));
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	}
});
					
// Listen for click on right arrow
$( "#rightarrow" ).on( "click", function() {
	// Clear the timeout every time if you navigate and you're not at the end ID of all the data
	if (toID != totalNumofRecords) {
			clearTimeout(clickTimeout);
	}

	// Clear form value in front-end when navigating data using the arrows
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";

	if ((fromID > (totalNumofRecords-((numOfRows-1)*2)) ) && (fromID < totalNumofRecords) ) { 		// If the "from" ID is within the IDs at the ending of the dataset
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		// Create table using the new set IDs inside a set timeout
		clickTimeout = setTimeout(function(){
			// Use resolved promises to fetch data from backend
			let headings = Promise.resolve(fetch("/columns").then(res => res.text()));
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	} else if (toID === totalNumofRecords) {													// If the "to" ID is the ending ID, then set the values and do not make any backend calls
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	} else {																					// Else, continue creating table with the set IDs
		fromID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toID = toID + (numOfRows-1);
		toIDElement.innerHTML = toID.toString();

		// Create table using the new set IDs inside a set timeout
		clickTimeout = setTimeout(function(){
			// Use resolved promises to fetch data from backend
			let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	}
});
							
// Listen for submission in form and use inputs to request data from backend
$( "#submit" ).on( "click", function() {
	// Clear the timeout every time if you submit on the form
	clearTimeout(clickTimeout);

	// Clear form value in from end when navigating data using the arrows
	let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
	let startFrom = startFromIDElement.valueAsNumber;

	// Checks to see if you request invalid values in the form
	if (startFrom < 1 || startFrom > (totalNumofRecords-(numOfRows-1))) {
		alert("The acceptable range is between 1 and "+(totalNumofRecords-(numOfRows-1)));
		return;
	} else if (isNaN(startFrom)) {
		alert("You have not set a value to submit.");
	} else {
		fromID = startFrom;
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	}

	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout(function(){
		// Use resolved promises to fetch data from backend
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});

// Listen for submission in form and use inputs to request data from backend
$( "#gotostart" ).on( "click", function() {
	// Clear the timeout every time if you click to go to start of dataset
	clearTimeout(clickTimeout);

	// Clear form value in front-end when navigating data using the arrows
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";

	// Set ID values to the start of the dataset
	fromID = 1;
	toID = numOfRows;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout(function(){
		// Use resolved promises to fetch data from backend
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});


$( "#gotoend" ).on( "click", function() {
	// Clear the timeout every time if you click to go to end of dataset
	clearTimeout(clickTimeout);

	// Clear form value in front-end when navigating data using the arrows
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";

	// Set ID values to the end of the dataset
	fromID = totalNumofRecords-(numOfRows-1);
	toID = totalNumofRecords;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout(function() {
		// Use resolved promises to fetch data from backend
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});


// Function to create table and render in browser
function generateTable(headingsStr: string, recordsStr: string) {
	// Instantiate grid table to append innerHTML
	let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

	// Empty the table in the html
	let emptyTable = document.querySelector('#table') as HTMLDivElement;
	emptyTable.innerHTML = "";										// clear table to empty html

	// Recreate table with new headings and records data
	let interfaceHeading: HasFormatMethod;							// variable of type interface used in creating table headings
	let interfaceRecords: HasFormatMethod;							// variable of type interface used in creating table rows
	interfaceHeading = new TableHeadingString(headingsStr);			// call method to generate string containing table heading element
	tble.constructTableHeadings(interfaceHeading);					// call method to render table headings element in browser
	interfaceRecords = new RenderTableRows(recordsStr);				// call method to generate string containing table row elements
}

// Function to target an element in html by its id
function el(s: string) {
	return document.getElementById(s);
}

// Function to create the initial table when loading the page for the first time or when the window size changes
function createInitialPage(numOfRows: number) {
	// Clear the timeout every time this function is called
	clearTimeout(clickTimeout);

	// Check if you're at the start or end of the data set, and reset IDs for change in window size
	if (fromID > (totalNumofRecords-(numOfRows-1))) {
		fromID = totalNumofRecords-(numOfRows-1);
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	} else {
		fromID = fromID;
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	}

	//Request for and set the total number of records
	request( "/recordCount", "GET", function(r: string) {
		try {
			numofrecords.innerHTML = r;
			totalNumofRecords = Number(r)-1;
		} catch(err) {
			console.log(err);
			return;
		}
	});

	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout(function(){
		// Use resolved promises to fetch data from backend
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
}

// Function returning number of rows based on window size
function getNumOfRows() {
	// Get height of screen
	screenHeight = window.innerHeight; 
				
	// Checks to return correct value for number of rows
	if (screenHeight >= 750) {
		return 23;
	} else if ((screenHeight < 750) && (screenHeight >= 550)) {
		return 18;
	} else if ((screenHeight < 550) && (screenHeight >= 265)) {
		return 8;
	} else if ((screenHeight < 265) && (screenHeight >= 95)) {
		return 3;
	} else if (screenHeight < 95) {
		return 2;
	} else {
		return 23;
	}
}