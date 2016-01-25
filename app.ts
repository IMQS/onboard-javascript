let ajax = (url: string, successCallBack: (resp: string) => void, failureCallBack: () => void) => {
	let req = new XMLHttpRequest();
	req.open("GET", url);
	req.send(null);
	// Callback function to check when the request is over:
	req.addEventListener("readystatechange", () => {
		if (req.readyState === req.DONE && req.status === 200) { 
			// IF all the data have been retrieved AND the status is OK
			successCallBack(req.responseText);
		} else if (req.readyState === req.DONE) {
			req.abort();
			failureCallBack();
			
		}
	}, false);
}

let failureCallBack = () => {
	alert("AJAX request failure. Please try again");
}

//Maximum number of elements that can be displayed depend on the actual size of the window
let maxNumberOfElem = (headSize: number, cellSize: number) => {
		return Math.floor((window.innerHeight - headSize) / cellSize);
}

class Grid {
	records: string[][];
	firstRecElem: number;
	lastRecElem: number;

	constructor(firstRecElem: number, lastRecElem: number) {
		this.firstRecElem = firstRecElem;
		this.lastRecElem = lastRecElem;
		this.retrieveRecordsAndDraw();
	} 

	retrieveRecordsAndDraw() {
		let RecordsGetSuccess = (resp: string) => {
			this.records = JSON.parse(resp);
			if (this.records) { // Draw the grid only when all the records have been retrieved
				let n: number = this.lastRecElem - this.firstRecElem + 1;
				let len: number = this.records[0].length;
				let columnsWidth: string = String(100 / len) + "%";
				for (let j = 0; j < n; j++) {
					let tr = document.createElement('tr');
					let idTr: string = "idTr-" + this.records[j][0];
					tr.setAttribute("id", idTr);
					tr.setAttribute("align", "center");
					tr.setAttribute("height", "25px");
					document.getElementById("idTbody").appendChild(tr);
					for (let i = 0; i < len; i++) {
						let td = document.createElement("td");
						td.setAttribute("width", columnsWidth);
						document.getElementById(idTr).appendChild(td);
						td.innerHTML = this.records[j][i];
					}
				}
			}
		}
		// HTTP request to retrieve the total number of records of the grid:
		ajax("http://localhost:2050/records?from=" + String(this.firstRecElem) + "&to=" + String(this.lastRecElem), RecordsGetSuccess, failureCallBack);
	} 

	drawGrid() {
		let rowCounts = (<HTMLTableElement> document.getElementById("idTbody")).rows.length;
		// Delete rows to be replacedc
		for (let i = 1; i <= rowCounts; i++) {
			(<HTMLTableElement> document.getElementById("idTbody")).deleteRow(-1);
		}
		delete this.records;
		this.retrieveRecordsAndDraw();
	} 

	// When the window is narrowed or expended
	onResize(headSize: number, cellSize: number, recordCount: number) {
		let newlastRecElem: number = this.firstRecElem + maxNumberOfElem(headSize, cellSize) - 1;
		if (newlastRecElem >= recordCount) {
			newlastRecElem = recordCount - 1;
		}
		if (this.lastRecElem > newlastRecElem) { // The windows has been narrowed
			let rowsToDel: number = this.lastRecElem - newlastRecElem;
			this.lastRecElem = newlastRecElem;
			for (let i = 0; i < rowsToDel; i++) {
				(<HTMLTableElement> document.getElementById("idTbody")).deleteRow(-1);
			}
		} else if (this.lastRecElem < newlastRecElem) { // The windows has been expended
			this.lastRecElem = newlastRecElem;
			this.drawGrid();
		}
	} 

	// Click on the "Next records" button 
	nextRec(headSize: number, cellSize: number, recordCount: number) {
		let lastRec: number = this.firstRecElem + maxNumberOfElem(headSize, cellSize) - 1;
		if (lastRec < recordCount - 1) { // Are there some records left to display?
			this.firstRecElem = this.lastRecElem + 1;
			this.lastRecElem = this.firstRecElem + maxNumberOfElem(headSize, cellSize) - 1;
			if (this.lastRecElem >= recordCount) { // Check if we are not trying to display more than we have
				this.lastRecElem = recordCount - 1;
			}
			this.drawGrid();
		} else {
			alert("Those are already the last records");
		}
	} 

	// Click on the "Previous records" button
	prevRec(headSize: number, cellSize: number, recordCount: number) {
		let firstRec: number = this.lastRecElem - maxNumberOfElem(headSize, cellSize) + 1;
		if (firstRec > 0) { // Check if we don't already have the first records
			this.lastRecElem = this.firstRecElem - 1;
			this.firstRecElem = this.lastRecElem - maxNumberOfElem(headSize, cellSize) + 1;
			if (this.firstRecElem < 0) { // Check if the id of the first record to be displayed is not negative
				this.firstRecElem = 0;
				this.lastRecElem = this.firstRecElem + maxNumberOfElem(headSize, cellSize) - 1;
			}
			this.drawGrid();
		} else {
			alert("Those are already the first records");
		}
	} 

	// Click on the "Firt records" button
	firstRec(headSize: number, cellSize: number, recordCount: number) {
		if (this.firstRecElem > 0) { // Check if we don't already have the first records
			this.firstRecElem = 0;
			this.lastRecElem = this.firstRecElem + maxNumberOfElem(headSize, cellSize) - 1;
			this.drawGrid();
		} else {
			alert("Those are already the first records");
		}
	}

	// Click on the "last records" button
	lastRec(headSize: number, cellSize: number, recordCount: number) {
		if (this.lastRecElem < recordCount - 1) { // Check if we are not trying to display more than we have 
			this.lastRecElem = recordCount - 1;
			this.firstRecElem = this.lastRecElem - maxNumberOfElem(headSize, cellSize) + 1;
			this.drawGrid();
		} else {
			alert("Those are already the last records");
		}
	}

} // End of class Grid

window.onload = () => {
	var recordCount: number;
	var columnsName: string[];

	let firstRecElem: number = 0;
	let lastRecElem: number = 0;

	// Check the height of the window in order to compute the total number of rows
	let headSize: number = 180;
	let cellSize: number = 26;

	let recordGetSuccess = (resp: string) => {
		recordCount = parseInt(resp);
	}
	// HTTP request to retrieve the total number of records of the grid:
	ajax('http://localhost:2050/recordCount', recordGetSuccess, failureCallBack);

	let columnsNameGetSuccess = (resp: string) => {
		columnsName = JSON.parse(resp);
		if (columnsName) {
			let columnsWidth = String(100 / columnsName.length) + "%";
			for (let i = 0; i < columnsName.length; i++) {
				let th = document.createElement("th");
				th.setAttribute("width", columnsWidth);
				document.getElementById("idColumnsName").appendChild(th);
				th.innerHTML = columnsName[i];
			}
		}
	}
	// HTTP request to retrieve the total number of records of the grid:
	ajax('http://localhost:2050/columns', columnsNameGetSuccess, failureCallBack);

	// Object that will contain the grid to be displayed
	// The constructor will retrieve the records and display the first ones depending on the size of the window
	lastRecElem = maxNumberOfElem(headSize, cellSize) - 1;
	let myGrid = new Grid(firstRecElem, lastRecElem);

	// When the window is narrowed or expended
	window.onresize = () => {
		myGrid.onResize(headSize, cellSize, recordCount);
	};

	// Click on the "Next records" button
	let nRec = document.getElementById("nRec");
	nRec.onclick = () => {
		myGrid.nextRec(headSize, cellSize, recordCount);
	}

	// Click on the "Previous records" button
	let pRec = document.getElementById("pRec");
	pRec.onclick = () => {
		myGrid.prevRec(headSize, cellSize, recordCount);
	}

	// Click on the "First Records" button
	let fRec = document.getElementById("fRec");
	fRec.onclick = () => {
		myGrid.firstRec(headSize, cellSize, recordCount);
	}

	// Click on the "Last Records" button
	let lRec = document.getElementById("lRec");
	lRec.onclick = () => {
		myGrid.lastRec(headSize, cellSize, recordCount);
	}
}; // End of window.onload