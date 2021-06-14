import { TableHeadingString } from "./classes/table-headings.js";
import { RenderTableRows } from "./classes/render-rows.js";
import { RenderTableHeading } from "./classes/render-headings.js";
import { HasFormatMethod } from "./interfaces/has-format-method.js";
import { request } from './httprequests/httpreq.js';

// Variable for tracking click events
let clicked = false;

//Accessing form data from front end
let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;
let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;
let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;

// Initializing variables for first page of data
let fromID = 1;
let toID = 23;
fromIDElement.innerHTML = fromID.toString();
toIDElement.innerHTML = toID.toString();

// Instantiate grid table to append innerHTML
let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

//Request for total number of records
request( "/recordCount", "GET", function(r: string) {
		try {
			numofrecords.innerHTML = r;
		} catch(err) {
			console.log(err);
			return;
		}
	}
);

// Render Initial Page of Data
createTable(fromID, toID); // create table and render to browser
			
// Listen for click on left arrow
// let leftarrow = document.querySelector("#leftarrow") as SVGElement;
$( "#leftarrow" ).on( "click", function() {
	if (!clicked) {
		clicked = true;
		let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
		startfrom.value = "";
		if (fromID < 22) {
			fromID = 1;
			toID = 23;
			fromIDElement.innerHTML = fromID.toString();
			toIDElement.innerHTML = toID.toString();
		} else {
			fromID = fromID - 22;
			toID = toID - 22;
			fromIDElement.innerHTML = fromID.toString();
			toIDElement.innerHTML = toID.toString();
		}
		
		createTable(fromID, toID);
	}
});
					
// Listen for click on right arrow
$( "#rightarrow" ).on( "click", function() {
	if (!clicked) {
		clicked = true;
		let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
		startfrom.value = "";
		if (fromID > (999999-44)) {
			fromID = (999999-22);
			toID = 999999;
			fromIDElement.innerHTML = fromID.toString();
			toIDElement.innerHTML = toID.toString();
		} else {
			fromID = fromID + 22;
			fromIDElement.innerHTML = fromID.toString();
			toID = toID + 22;
			toIDElement.innerHTML = toID.toString();
		}
	
		createTable(fromID, toID);
	}
});
							
// Listen for submission in form and use inputs to request data from backend
$( "#submit" ).on( "click", function() {
	let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
	let startFrom = startFromIDElement.valueAsNumber;

	if (startFrom < 1 || startFrom > 999977) {
		alert("The acceptable range is between 1 and 999977");
		return;
	}
	else {
		fromID = startFrom;
		toID = fromID + 22;
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
	toID = 23;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	createTable(fromID, toID);
});

$( "#gotoend" ).on( "click", function() {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 999977;
	toID = 999999;
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();
	
	createTable(fromID, toID);
});

function createTable(fromID: number, toID: number) {
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; 												// empty table every time a new submission is made
	
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
	let interfaceHeading: HasFormatMethod;							// variable of type interface used in creating table headings
	let interfaceRecords: HasFormatMethod;							// variable of type interface used in creating table rows
	interfaceHeading = new TableHeadingString(headingsStr);			// call method to generate string containing table heading element
	interfaceRecords = new RenderTableRows(recordsStr);				// call method to generate string containing table row elements
	tble.constructTableHeadings(interfaceHeading);					// call method to render table headings element in browser
}

function el(s: string) {
	return document.getElementById(s);
}

