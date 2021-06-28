// Global Variables
let screenHeight = screen.height;								
let numOfRows = getNumOfRows();		// Call function to get number of rows to render based on current screen size
let totalNumofRecords: number;						
let clickTimeout: ReturnType<typeof setTimeout>;	
let fromID = 1;										
let toID = numOfRows;								

// Get list of headings
fetch("/columns").then(res => res.text()).then((headingsStr) => {
	// Instantiate grid table to append innerHTML
	let hd = new RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);
	let interfaceHeading: HasFormatMethod;							// Variable of type interface used in creating table headings
	interfaceHeading = new TableHeadingString(headingsStr);			// Call method to generate string containing table heading element
	hd.constructTableHeadings(interfaceHeading);					// Call method to render table headings element in browser
}).catch(err => console.log(err));

// Create initial page
createInitialPage(numOfRows);

// Listen for change in window size
window.addEventListener('resize', () => {
	screenHeight = window.innerHeight;	
	numOfRows = getNumOfRows();	

	// Get records from backend
	getRecords(fromID, toID);
});

// Listen for clicks on left arrow
$( "#leftarrow" ).on( "click", () => {
	if (fromID < (numOfRows-1) && fromID > 1 || fromID === 1) {
		fromID = 1;
		toID = numOfRows;
	} else {
		fromID = fromID - (numOfRows-1);
		toID = toID - (numOfRows-1);
	}

	// Get records from backend
	getRecords(fromID, toID);
});
					
// Listen for clicks on right arrow
$( "#rightarrow" ).on( "click", () => {
	if (fromID > (totalNumofRecords-((numOfRows-1)*2)) && fromID < totalNumofRecords || toID === totalNumofRecords) { 	
		fromID = (totalNumofRecords-(numOfRows-1));
		toID = totalNumofRecords;
	} else {
		fromID = fromID + (numOfRows-1);
		toID = toID + (numOfRows-1);
	}
	
	// Get records from backend
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

	// Get records from backend
	getRecords(fromID, toID);
});

// Listen for click to go to start of data
$( "#gotostart" ).on( "click", () => {
	// Clear the timeout every time if you click to go to start of dataset
	clearTimeout(clickTimeout);

	// Set ID values to the start of the dataset
	fromID = 1;
	toID = numOfRows;

	// Get records from backend
	getRecords(fromID, toID);
});

// Listen for sclick to go to end of data
$( "#gotoend" ).on( "click", () => {
	// Clear the timeout every time if you click to go to end of dataset
	clearTimeout(clickTimeout);

	// Set ID values to the end of the dataset
	fromID = totalNumofRecords-(numOfRows-1);
	toID = totalNumofRecords;
	
	// Get records from backend
	getRecords(fromID, toID);
});

// Function to create the initial table when loading the page for the first time or when the window size changes
function createInitialPage(numOfRows: number) {
	let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;		
	let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			
	let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				

	// Clear the timeout every time this function is called
	clearTimeout(clickTimeout);

	// Check if you're at the start or end of the data set, and reset IDs for change in window size
	if (fromID > (totalNumofRecords-(numOfRows-1))) {
		fromID = totalNumofRecords-(numOfRows-1);
	} else {
		fromID = fromID;
	}
	
	toID = fromID + (numOfRows-1);
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	//Request for and set the total number of records
	fetch("/recordCount").then(res => res.text()).then((value) => {
		numofrecords.innerHTML = value;
		totalNumofRecords = Number(value) - 1;
	}).catch(err => console.log(err));

	// Get records from backend
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
	let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			
	let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				

	// Change fromID and toID according to changes in numOfRows
	if (fromID > (totalNumofRecords-(numOfRows-1))) {
		fromID = totalNumofRecords-(numOfRows-1);
	} else {
		fromID = fromID;
	}
	toID = fromID + (numOfRows-1);

	// Change innerHTML for fromID and toID
	fromIDElement.innerHTML = fromID.toString();
	toIDElement.innerHTML = toID.toString();

	// Clear the timeout every time if you navigate and you're not at the start ID of all the data
	if (fromID != 1 || toID != totalNumofRecords) {
		clearTimeout(clickTimeout);
	}

	// Create table using the new set IDs inside a set timeout
	clickTimeout = setTimeout( () => {
		let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
        startfrom.value = "";

        fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()).then((recordsStr) => {
			// Empty the table in the html
			let emptyTable = document.querySelector('#records') as HTMLDivElement;
			emptyTable.innerHTML = "";												// Clear table to empty html
	
			// Recreate table with new headings and records data
			let interfaceRecords: HasFormatMethod;									// Variable of type interface used in creating table rows
			interfaceRecords = new RenderTableRows(recordsStr);						// Call method to generate string containing table row elements
        }).catch(err => console.log(err));
	}, 200);
}

class RenderTableRows implements HasFormatMethod {
	private returnStr = "";
	private arrLength = 0;
	
	constructor( recordsStr: string ){
		let records = document.querySelector('#records') as HTMLDivElement;			
		let navigation = document.querySelector('#navigation') as HTMLDivElement;	
		let myArr = JSON.parse(recordsStr);											

		// Edit styling of the table and navigation bar
		records.style.display = "grid";
		records.style.gridTemplateRows = "repeat(auto-fill, "+(100/(myArr.length+2))+"%)";
		records.style.height = "100%";
		navigation.style.height = (100/(myArr.length+2))+"%";
		let headings = document.querySelector('#headings') as HTMLDivElement;
		headings.style.height = 100/(myArr.length+2)+"%";
		
		// Create innerHTML text to be rendered to front-end in the table div
		for(let i=0;i<myArr.length;i++) {
			for(let j=0;j<myArr[i].length;j++) {
				this.arrLength = myArr[i].length;
				this.returnStr += 
					"<div><p>"+myArr[i][j]+"</p></div>";
			}

			// Append innerHTML text to div element in front-end
			let div = document.createElement('div');
			div.innerHTML = this.returnStr;
			div.className = "tablecell";
			div.style.gridTemplateColumns = "repeat("+this.arrLength+", 1fr)";
			records.append(div);
			this.returnStr = "";
		}
	}

	// Returns length of array of headings to get number of columns necessary to render
	arrayLength() {
		return this.arrLength;
	}

	// Returns formatted string to be placed in html
	internalFormat() {
		return this.returnStr;
	}
}

class RenderTableHeading {
    constructor(private container: HTMLDivElement) {}

    constructTableHeadings(hd: HasFormatMethod) {
		let div = document.createElement('div');
        div.innerHTML = hd.internalFormat();
        div.className = "tablecell";
        div.style.gridTemplateColumns = "repeat("+hd.arrayLength()+", 1fr)";

        this.container.append(div);
    }
}

class TableHeadingString implements HasFormatMethod {
	private returnStr = "";
	private arrLength = 0;

	constructor( headingsStr: string){
		let myArr = JSON.parse(headingsStr);
		this.arrLength = myArr.length;

		// Create innerHTML text to be rendered to front-end in the table div
		for(let i=0;i<myArr.length;i++){
			this.returnStr += 
			"<div><p><b>"+myArr[i]+"</b></p></div>";
		}
	}

	// Returns length of array of headings to get number of columns necessary to render
	arrayLength() {
		return this.arrLength;
	}
	
	// Returns formatted string to be placed in html
	internalFormat() {
		return this.returnStr;
	}
}



// Interface with internal format method
interface HasFormatMethod {
    arrayLength(): number;
    internalFormat(): string;
}