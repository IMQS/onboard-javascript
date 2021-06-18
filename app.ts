import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";
import { request } from './httprequests/httpreq.js';

// Instantiate grid table to append innerHTML
let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

let headingsStr: string;
let recordsStr: string;

// Screen Size
let screenWidth = screen.width;
let screenHeight = screen.height;

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
	} else if ((screenHeight < 265) && (screenHeight >= 95)) {
		numOfRows = 3;
	} else if (screenHeight < 95) {
		numOfRows = 2;
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

		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	} else if (fromID === 1) {
		// do nothing
	} else {
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
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

		let headings = Promise.resolve(fetch("/columns").then(res => res.text()));
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}  else if (toID === totalNumofRecords) {
		// do nothing
	} else {
		fromID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toID = toID + (numOfRows-1);
		toIDElement.innerHTML = toID.toString();

		let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
		let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

		Promise.all([headings, records]).then((values) => {
			generateTable(values[0], values[1]);
		}).catch(err => console.log(err));
	}
});
							
// Listen for submission in form and use inputs to request data from backend
$( "#submit" ).on( "click", function() {
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

	let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

	Promise.all([headings, records]).then((values) => {
		generateTable(values[0], values[1]);
	}).catch(err => console.log(err));
});

// Listen for submission in form and use inputs to request data from backend
$( "#gotostart" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 1;
	toID = numOfRows;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

	Promise.all([headings, records]).then((values) => {
		generateTable(values[0], values[1]);
	}).catch(err => console.log(err));
});


$( "#gotoend" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = totalNumofRecords-(numOfRows-1);
	toID = totalNumofRecords;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));

	Promise.all([headings, records]).then((values) => {
		generateTable(values[0], values[1]);
	}).catch(err => console.log(err));
});

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

	let headings = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records = Promise.resolve(fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()));
	let headings1 = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records1 = Promise.resolve(fetch("/records?from="+23+"&to="+45).then(res => res.text()));
	let headings2 = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records2 = Promise.resolve(fetch("/records?from="+45+"&to="+67).then(res => res.text()));
	let headings3 = Promise.resolve(fetch("/columns").then(res => res.text())); 
	let records3 = Promise.resolve(fetch("/records?from="+67+"&to="+89).then(res => res.text()));

	Promise.all([headings, records, headings1, records1, headings2, records2, headings3, records3]).then((values) => {
		let vLngth = values.length;
		generateTable(values[vLngth-2], values[vLngth-1]);
	}).catch(err => console.log(err));
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
	} else if ((screenHeight < 265) && (screenHeight >= 95)) {
		return 3;
	} else if (screenHeight < 95) {
		return 2;
	} else {
		return 23;
	}
}