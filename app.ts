import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";

// Global Variables
let numOfRows = getNumOfRows();															// Call function to get number of rows to render based on current screen size
let totalNumofRecords: number;															// Declare public variable to store total number of records from the server
let clickTimeout: ReturnType<typeof setTimeout>;										// Set a timeout to use for promises when navigating through data

let fromID = 1;
let toID = numOfRows;

// Create initial page with initial data
createHeadings();
createInitialPage(numOfRows);

// Listen for change in window size
let screenHeight = screen.height;
window.addEventListener('resize', () => {
	screenHeight = window.innerHeight;	
	numOfRows = Math.round(screenHeight / 33);

	// Recreate grid with new set number of rows
	createInitialPage(numOfRows);
});

// When clicking on left arrow
$( "#leftarrow" ).on( "click", () => {	
	if (fromID < (numOfRows-1) && fromID > 1) {		// If the "from" ID is within the IDs at the beginning of the dataset
		fromID = 1;
		toID = numOfRows;
	} else if (fromID === 1) {						// If the "from" ID is 1 then set the values and do not make any backend calls
		fromID = 1;
		toID = numOfRows;
	} else {
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
	}

	getRecords(fromID, toID);
	
});
					
// Listen for click on right arrow
$( "#rightarrow" ).on( "click", () => {
	if (fromID > (totalNumofRecords-((numOfRows-1)*2)) && fromID < totalNumofRecords ) { 		// If the "from" ID is within the IDs at the ending of the dataset
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
	} else if (toID === totalNumofRecords) {													// If the "to" ID is the ending ID, then set the values and do not make any backend calls
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
	} else {
		fromID = fromID + (numOfRows-1);
		toID = toID + (numOfRows-1);
	}
	
	getRecords(fromID, toID);
});
							
// Listen for submission in form and use inputs to request data from backend
$( "#submit" ).on( "click", () => {
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
		return;
	}
	
	fromID = startFrom;
	toID = fromID + (numOfRows-1);

	getRecords(fromID, toID);
});

// Listen for submission in form and use inputs to request data from backend
$( "#gotostart" ).on( "click", () => {
	// Clear the timeout every time if you click to go to start of dataset
	clearTimeout(clickTimeout);

	// Set ID values to the start of the dataset
	fromID = 1;
	toID = numOfRows;

	getRecords(fromID, toID);
});

$( "#gotoend" ).on( "click", () => {
	// Clear the timeout every time if you click to go to end of dataset
	clearTimeout(clickTimeout);

	// Set ID values to the end of the dataset
	fromID = totalNumofRecords-(numOfRows-1);
	toID = totalNumofRecords;
	
	getRecords(fromID, toID);
});

// Function to create table and render in browser
function generateHeadings(headingsStr: string) {
	// Instantiate grid table to append innerHTML
	let hd = new RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);

	let interfaceHeading: HasFormatMethod;							// variable of type interface used in creating table headings
	interfaceHeading = new TableHeadingString(headingsStr);			// call method to generate string containing table heading element
	hd.constructTableHeadings(interfaceHeading);					// call method to render table headings element in browser
}

function generateTable(recordsStr: string) {
	// Empty the table in the html
	let emptyTable = document.querySelector('#records') as HTMLDivElement;
	emptyTable.innerHTML = "";										// clear table to empty html

	// Recreate table with new headings and records data
	let interfaceRecords: HasFormatMethod;							// variable of type interface used in creating table rows
	interfaceRecords = new RenderTableRows(recordsStr);				// call method to generate string containing table row elements
}

// Function to create the initial table when loading the page for the first time or when the window size changes
function createHeadings() {
	//Request for and set the total number of records
	fetch("/columns").then(res => res.text()).then((value) => {
		generateHeadings(value);
	}).catch(err => console.log(err));
}

// Function to create the initial table when loading the page for the first time or when the window size changes
function createInitialPage(numOfRows: number) {
	let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;		// Accessing form data from front end
	let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			// Accessing form data from front end
	let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				// Accessing form data from front end

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
	fetch("/recordCount").then(res => res.text()).then((value) => {
		numofrecords.innerHTML = value;
		totalNumofRecords = Number(value) - 1;
	}).catch(err => console.log(err))

	getRecords(fromID, toID);
}

// Function returning number of rows based on window size
function getNumOfRows() {
	// Get height of screen
	screenHeight = window.innerHeight; 
	return Math.round(screenHeight/33);
}

// Function returning number of rows based on window size
function getRecords(fromID: number, toID: number) {
	let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			// Accessing form data from front end
	let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				// Accessing form data from front end

	// Clear the timeout every time if you navigate and you're not at the start ID of all the data
	if (fromID != 1) {
		clearTimeout(clickTimeout);
	} else if (toID != totalNumofRecords) {
		clearTimeout(clickTimeout);
	}

	// Clear form value in front-end when navigating data using the arrows
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";

	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout( () => {
		fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()).then((value) => {
			generateTable(value);
		}).catch(err => console.log(err))
	}, 200);
}