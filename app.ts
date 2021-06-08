import { tableHeadings } from "./classes/table_headings.js";
import { recordStruct } from "./classes/record_struct.js";
import { createTable } from "./classes/create_table.js";
import { HasFormatMethod } from "./interfaces/hasformatmethod.js";
import { request } from './classes/httpreq.js';


//Accessing form data
const form = document.querySelector('#form') as HTMLFormElement;
const fromID = document.querySelector('#fromID') as HTMLInputElement;
const toID = document.querySelector('#toID') as HTMLInputElement;

// Instantiate grid table to append innerHTML
let tble = new createTable(document.querySelector('#table') as HTMLTableElement);

// Strings holding heading and records data requested from server
let headingsStr: string;
let recordsStr: string;

// Listen for submission in form and use inputs to request data from backend
form.addEventListener('submit', (e: Event) => {
	document.getElementById("table")!.innerHTML = "";
	e.preventDefault();
	
	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: any) {
			try {
				headingsStr = r; // set response from server
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);

	// Fetch records from server
	let url: string = "/records?from="+fromID.valueAsNumber+"&to="+toID.valueAsNumber;
	request(
		url, "GET",
		function(r: any) {
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
	interfaceHeading = new tableHeadings(headingsStr);		// call method to generate string containing table heading element
	tble.constructTableHeadings(interfaceHeading);			// call method to render table headings element in browser
	interfaceRecords = new recordStruct(recordsStr);		// call method to generate string containing table row elements
}

