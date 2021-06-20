import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";
import { request } from './httprequests/httpreq.js';

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

// Create initial page
createInitialPage(numOfRows);

// Listening for change in screen size
let screenHeight = screen.height;
window.addEventListener('resize', function(event) {
	screenHeight = window.innerHeight;
							
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

	createInitialPage(numOfRows);
});

let clickTimeout: ReturnType<typeof setTimeout>;

// When clicking on left arrow
$( "#leftarrow" ).on( "click", function() {
	clearTimeout(clickTimeout);

	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if ((fromID < (numOfRows-1)) && (fromID > 1)) {
		fromID = 1;
		toID = numOfRows;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		clickTimeout = setTimeout(function(){
			let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	} else if (fromID === 1) {
		// do nothing
	} else {
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		clickTimeout = setTimeout(function(){
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
	clearTimeout(clickTimeout);

	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if ((fromID > (totalNumofRecords-((numOfRows-1)*2)) ) && (fromID < totalNumofRecords) ) {
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		clickTimeout = setTimeout(function(){
			let headings = Promise.resolve(fetch("/columns").then(res => res.text()));
			let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
			Promise.all([headings, records]).then((values) => {
				generateTable(values[0], values[1]);
			}).catch(err => console.log(err));
		}, 500);
	}  else if (toID === totalNumofRecords) {
		// do nothing
	} else {
		fromID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toID = toID + (numOfRows-1);
		toIDElement.innerHTML = toID.toString();

		clickTimeout = setTimeout(function(){
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
	clearTimeout(clickTimeout);
	let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
	let startFrom = startFromIDElement.valueAsNumber;

	if (startFrom < 1 || startFrom > (totalNumofRecords-(numOfRows-1))) {
		alert("The acceptable range is between 1 and "+(totalNumofRecords-(numOfRows-1)));
		return;
	}
	else {
		fromID = startFrom;
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	}

	clickTimeout = setTimeout(function(){
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});

// Listen for submission in form and use inputs to request data from backend
$( "#gotostart" ).on( "click", function() {
	clearTimeout(clickTimeout);
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 1;
	toID = numOfRows;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	clickTimeout = setTimeout(function(){
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});


$( "#gotoend" ).on( "click", function() {
	clearTimeout(clickTimeout);
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = totalNumofRecords-(numOfRows-1);
	toID = totalNumofRecords;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	clickTimeout = setTimeout(function(){
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
});


// Create table and render in browser
function generateTable(headingsStr: string, recordsStr: string) {
	// Instantiate grid table to append innerHTML
	let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

	let emptyTable = document.querySelector('#table') as HTMLDivElement;
	emptyTable.innerHTML = "";												// clear table to empty html
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
	clearTimeout(clickTimeout);

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
	
	fromID = fromID;
	toID = fromID + (numOfRows-1);
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

	clickTimeout = setTimeout(function(){
		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}, 500);
}

function getNumOfRows() {
	screenHeight = window.innerHeight; 
							
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