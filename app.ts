/// <reference path="has-format-method.ts" />

namespace HasFormatMethod {
	// Global variable
	let timeOut: ReturnType<typeof setTimeout>;				

	// Run functions when window loads
	window.onload = () => {
		getColumnsHeadings();
		getRecordCount();
	};

	// Listen for change in window size
	window.addEventListener('resize', () => {
		// Clear the timeout every time if you submit on the form
		clearTimeout(timeOut);

		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		
		let fID = document.querySelector('#fromID') as HTMLParagraphElement;
		let tID = document.querySelector('#toID') as HTMLParagraphElement;
		getRecords(Number(fID.innerHTML), Number(tID.innerHTML), totalNumofRecords);
	});

	// Listen for clicks on left arrow
	$( "#leftarrow" ).on( "click", () => {
		// // Clear the timeout every time if you submit on the form
		clearTimeout(timeOut);
		
		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		let numOfRows = getNumOfRows();
		
		let fID = document.querySelector('#fromID') as HTMLParagraphElement;
		let tID = document.querySelector('#toID') as HTMLParagraphElement;
		let fromID = Number(fID.innerHTML);
		let toID = Number(tID.innerHTML);
		
		if ((fromID < numOfRows && fromID > 0) || fromID === 0) {
			fromID = 0;
			toID = numOfRows-1;
		} else {
			fromID = fromID - (numOfRows-1);
			toID = toID - (numOfRows-1);
		}

		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	});
						
	// Listen for clicks on right arrow
	$( "#rightarrow" ).on( "click", () => {
		// Clear the timeout every time if you submit on the form
		clearTimeout(timeOut);

		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		let numOfRows = getNumOfRows();

		let fID = document.querySelector('#fromID') as HTMLParagraphElement;
		let tID = document.querySelector('#toID') as HTMLParagraphElement;
		let fromID = Number(fID.innerHTML);
		let toID = Number(tID.innerHTML);
		
		if (fromID > (totalNumofRecords-((numOfRows-1)*2)) && fromID < totalNumofRecords || toID === totalNumofRecords) { 	
			fromID = (totalNumofRecords-(numOfRows-1));
			toID = totalNumofRecords;
		} else {
			fromID = fromID + (numOfRows-1);
			toID = toID + (numOfRows-1);
		}
		
		
		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	});
								
	// Listen for submission in form and use inputs to request data from backend
	$( "#submit" ).on( "click", () => {
		// Clear the timeout every time if you submit on the form
		clearTimeout(timeOut);

		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		let numOfRows = getNumOfRows();

		let fID = document.querySelector('#fromID') as HTMLParagraphElement;
		let tID = document.querySelector('#toID') as HTMLParagraphElement;
		let fromID = Number(fID.innerHTML);
		let toID = Number(tID.innerHTML);

		// Clear form value in from end when navigating data using the arrows
		let startFromIDElement = document.querySelector('#startfrom') as HTMLInputElement;
		let startFrom = startFromIDElement.valueAsNumber;

		// Checks to see if you request invalid values in the form
		if (startFrom < 0 || startFrom > (totalNumofRecords-(numOfRows-1))) {
			alert("The acceptable range is between 0 and "+(totalNumofRecords-(numOfRows-1)));
			return;
		} else if (isNaN(startFrom)) {
			alert("You have not set a value to submit.");
			return;
		}
		
		fromID = startFrom;
		toID = fromID + (numOfRows-1);

		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	});

	// Listen for click to go to start of data
	$( "#gotostart" ).on( "click", () => {
		// Clear the timeout every time if you click to go to start of dataset
		clearTimeout(timeOut);

		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		let numOfRows = getNumOfRows();

		// Set ID values to the start of the dataset
		let fromID = 0;
		let toID = numOfRows;

		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	});

	// Listen for sclick to go to end of data
	$( "#gotoend" ).on( "click", () => {
		let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
		let totalNumofRecords = Number(numofrecords.innerHTML)-1;
		let numOfRows = getNumOfRows();
		// Clear the timeout every time if you click to go to end of dataset
		clearTimeout(timeOut);

		// Set ID values to the end of the dataset
		let fromID = totalNumofRecords-(numOfRows-1);
		let toID = totalNumofRecords;
		
		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	});

	// Function to create the initial table when loading the page for the first time or when the window size changes
	function createInitialPage(numOfRows: number, totalNumofRecords: number) {
		// Clear the timeout every time this function is called
		clearTimeout(timeOut);

		let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			
		let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				

		let fID = document.querySelector('#fromID') as HTMLParagraphElement;
		let tID = document.querySelector('#toID') as HTMLParagraphElement;
		let fromID = Number(fID.innerHTML);
		let toID = Number(tID.innerHTML);
		
		// Check if you're at the start or end of the data set, and reset IDs for change in window size
		if (fromID > (totalNumofRecords-(numOfRows-1))) {
			fromID = totalNumofRecords-(numOfRows-1);
		} else {
			fromID = fromID;
		}
		
		toID = fromID + (numOfRows-1);
		fromIDElement.innerHTML = fromID.toString();
		toIDElement.innerHTML = toID.toString();

		// Get records from backend
		getRecords(fromID, toID, totalNumofRecords);
	}

	// Function returning number of rows based on window size
	function getNumOfRows() {
		return Math.round(window.innerHeight/33);
	}

	// Function returning number of rows based on window size
	function getRecords(fromID: number, toID: number, totalNumofRecords: number) {
		let numOfRows = getNumOfRows();
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
			clearTimeout(timeOut);
		}

		// Create table using the new set IDs inside a set timeout
		clickTimeout(fromID, toID);	
	}

	function clickTimeout(fromID: number, toID: number) {
		timeOut = setTimeout( () => {
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
		return timeOut;
	}

	function getColumnsHeadings() {
		// Get list of headings
		fetch("/columns").then(res => res.text()).then((headingsStr) => {
			// Instantiate grid table to append innerHTML
			let hd = new RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);
			let interfaceHeading: HasFormatMethod;						// Variable of type interface used in creating table headings
			interfaceHeading = new TableHeadingString(headingsStr);			// Call method to generate string containing table heading element
			hd.constructTableHeadings(interfaceHeading);					// Call method to render table headings element in browser
		}).catch(err => console.log(err));
	}

	function getRecordCount() {
		// Get total number of records
		fetch("/recordCount").then(res => res.text()).then(
			(value) => {
				let numofrecords = document.querySelector('#numofrecords') as HTMLParagraphElement;
				numofrecords.innerHTML = value; 
				let t = Number(value) - 1;
				// Create initial page
				createInitialPage(getNumOfRows(), t);
			}
		).catch(err => console.log(err));
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
        constructor(  private container: HTMLDivElement) {}
        
        constructTableHeadings(hd: HasFormatMethod) {
            let div = document.createElement('div');
            div.innerHTML = hd.internalFormat();
            div.className = "tablecell";
            div.style.gridTemplateColumns = "repeat("+hd.arrayLength()+", 1fr)";

            this.container.append(div);
        }
    }
}