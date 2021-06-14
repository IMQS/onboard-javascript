import { TableHeadingString } from "./classes/table_headings.js";
import { RenderTableRows } from "./classes/render_rows.js";
import { RenderTableHeading } from "./classes/render_headings.js";
import { HasFormatMethod } from "./interfaces/hasformatmethod.js";
import { request } from './httprequests/httpreq.js';

// Strings holding heading and records data requested from server
let headingsStr: string;
let recordsStr: string;
let numberOfRecordsStr: string;

//Accessing form data
let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;
let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;
let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;

let fromID = 1;
fromIDElement.innerHTML = fromID.toString();
let toID = 23;
toIDElement.innerHTML = toID.toString();

// Fetch number of records
request(
	"/recordCount", "GET",
	function(r: string) {
		try {
			numofrecords.innerHTML = r;
		} catch(err) {
			console.log(err);
			return;
		}
	}
);
	
// Fetch table headings from server
request(
	"/columns", "GET",
	function(r: string) {
		try {
			headingsStr = r; // set response from server
			// Fetch records from server
			let url = "/records?from=1&to=23";
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
		} catch(err) {
			console.log(err);
			return;
		}
	}
);
			
			
			
// Instantiate grid table to append innerHTML
let tble = new RenderTableHeading(document.querySelector('#table') as HTMLDivElement);
			
			
// Listen for click on left and use inputs to request data from backend
let leftarrow = document.querySelector("#leftarrow") as SVGElement;
leftarrow.addEventListener("click", (e:Event) => {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if (fromID < 22) {
		fromID = 1;
		fromIDElement.innerHTML = fromID.toString();
		toID = 23;
		toIDElement.innerHTML = toID.toString();
	} else {
		fromID = fromID - 22;
		toID = toID - 22;
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();
	}
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();
	
	// Fetch table headings from server
	request (
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
				// Fetch records from server
				let url = "/records?from="+fromID+"&to="+toID;
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
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});
					
// Listen for submission in form and use inputs to request data from backend
let rightarrow = document.querySelector("#rightarrow") as SVGElement;
rightarrow.addEventListener("click", (e:Event) => {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	if (fromID > (999999-44)) {
		fromID = (999999-22);
		fromIDElement.innerHTML = fromID.toString();
		toID = 999999;
		toIDElement.innerHTML = toID.toString();
	} else {
		fromID = fromID + 22;
		fromIDElement.innerHTML = fromID.toString();
		toID = toID + 22;
		toIDElement.innerHTML = toID.toString();
	}
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();

	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
				// Fetch records from server
				let url = "/records?from="+fromID+"&to="+toID;
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
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});
							
// Listen for submission in form and use inputs to request data from backend
let submit = document.querySelector("#submit") as HTMLInputElement;
submit.addEventListener("click", (e:Event) => {
	let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
	let startFrom = startFromIDElement.valueAsNumber;

	if (startFrom < 1 || startFrom > 999977) {
		alert("The acceptable range is between 1 and 999977");
		return;
	}
	else {
		fromID = startFrom;
		fromIDElement.innerHTML = fromID.toString();
		toID = fromID + 22;
		toIDElement.innerHTML = toID.toString();
	}
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();
	
	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
				// Fetch records from server
				let url = "/records?from="+fromID+"&to="+toID;
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
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});

// Listen for submission in form and use inputs to request data from backend
let gotostart = document.querySelector("#gotostart") as HTMLInputElement;
gotostart.addEventListener("click", (e:Event) => {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 1;
	fromIDElement.innerHTML = fromID.toString();
	toID = 23;
	toIDElement.innerHTML = toID.toString();
	
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();
	
	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
				// Fetch records from server
				let url = "/records?from="+fromID+"&to="+toID;
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
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});

// Listen for submission in form and use inputs to request data from backend
let gotoend = document.querySelector("#gotoend") as HTMLInputElement;
gotoend.addEventListener("click", (e:Event) => {
	let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
	startfrom.value = "";
	fromID = 999977;
	fromIDElement.innerHTML = fromID.toString();
	toID = 999999;
	toIDElement.innerHTML = toID.toString();
	
	let t = document.querySelector('#table') as HTMLDivElement;
	t.innerHTML = ""; // empty table every time a new submission is made
	e.preventDefault();
	
	// Fetch table headings from server
	request(
		"/columns", "GET",
		function(r: string) {
			try {
				headingsStr = r; // set response from server
				// Fetch records from server
				let url = "/records?from="+fromID+"&to="+toID;
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

