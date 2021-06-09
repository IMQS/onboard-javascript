import { TableHeadingString } from "./classes/table_headings.js";
import { RenderTableRows } from "./classes/render_rows.js";
import { RenderTableHeading } from "./classes/render_headings.js";
import { HasFormatMethod } from "./interfaces/hasformatmethod.js";
import { request } from './httprequests/httpreq.js';


//Accessing form data
let form = document.querySelector('#form') as HTMLFormElement;
let fromID = document.querySelector('#fromID') as HTMLInputElement;
let toID = document.querySelector('#toID') as HTMLInputElement;

// Instantiate grid table to append innerHTML
let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);

// Strings holding heading and records data requested from server
let headingsStr: string;
let recordsStr: string;

// Listen for submission in form and use inputs to request data from backend
form.addEventListener('submit', (e: Event) => {
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();
	
	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);

	// Fetch records from server
	let url = "/records?from="+fromID.valueAsNumber+"&to="+toID.valueAsNumber;
	request(
		url, "GET",
		function(r: string) {
			try {
				recordsStr = r; 	// set response from server
				generateTable(); 	// call function to render table in browser
				
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});

// Create table and render in browser
function generateTable(){
	let interfaceHeading: HasFormatMethod;					// variable of type interface used in creating table headings
	let interfaceRecords: HasFormatMethod;					// variable of type interface used in creating table rows
	interfaceHeading = new TableHeadingString(headingsStr);	// call method to generate string containing table heading element
	tble.constructTableHeadings(interfaceHeading);			// call method to render table headings element in browser
	interfaceRecords = new RenderTableRows(recordsStr);		// call method to generate string containing table row elements
}

function el(s: string) {
	return document.getElementById(s);
}

