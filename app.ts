let totalRecords = 0;
let indexPos = 0;

class AjaxCall {
	url: string = "http://localhost:2050";
	indexStart: number;
	indexFinish: number;
	fullQuery: string;
	request: string;
	objHttpReq: any;

	doAjaxCall(request: string, callback: Function, start?: number, finish?: number) {
		this.request = request;
		this.indexStart = start;
		this.indexFinish = finish;
		if (start >= 0) { this.fullQuery = this.url + "/" + request + "?from=" + start + "&to=" + finish; }
		else { this.fullQuery = this.url + "/" + request; }
		this.objHttpReq = new XMLHttpRequest();
		this.objHttpReq.onreadystatechange = () => this.onRStateChange(callback);
		this.objHttpReq.open("Get", this.fullQuery, true);
		this.objHttpReq.send();
	}

	onRStateChange(callback: Function) {
		if (this.objHttpReq.readyState === 4 && this.objHttpReq.status === 200) {
			let data = JSON.parse(this.objHttpReq.responseText);
			(callback)(data, this.indexStart, this.indexFinish);
		}
		// Handle error responses here if required
	}
}

// Create table header row based on columns received
function populateColumns(columns: JSON) {
	let columnArray = Object.keys(columns).map(function (k) { return columns[k]; });
	let htmlTable = document.getElementById("table-header");
	let tr = document.createElement('tr');
	let columnCount = columnArray.length;
	for (let i = 0; i < columnCount; i++) {
		let th = document.createElement('th');
		th.innerHTML = columnArray[i];
		tr.appendChild(th);
	}
	htmlTable.appendChild(tr);
}

// Total record counter update.  Only called once on page load
function updateRecordCounter(recordCount: JSON) {
	totalRecords = Number(JSON.stringify(recordCount));
	document.getElementById("page-total").innerHTML = String(totalRecords);
}

// Update table with content received from API call
function updateGrid(records: JSON, start: number, finish: number) {
	indexPos = start;
	document.getElementById("page-progress").innerHTML = "Displaying " + start + " to " + finish + " of ";
	let recordArray = Object.keys(records).map(function (k) { return records[k]; });
	let tableContent = document.getElementById("table-body");
	// Clear old table content
	while (tableContent.firstChild) {
		tableContent.removeChild(tableContent.firstChild);
	}
	// Create new tr and td elements with data from JSON objects
	for (let i = 0; i < recordArray.length; i++) {
		let tr = document.createElement("tr");
		let iContent = recordArray[i];
		for (let j = 0; j < iContent.length; j++) {
			let td = document.createElement("td");
			td.innerHTML = iContent[j];
			tr.appendChild(td);
		}
		tableContent.appendChild(tr);
	}
}

window.onload = () => {
	// Get brower height and calculate number of rows to display
	let browserHeight = window.innerHeight - 205;
	let pageSize = Math.floor(browserHeight / 33);

	// Initialise Ajax calls and retrieve initial data
	let ajColumns = new AjaxCall();
	let ajRecordCount = new AjaxCall();
	let ajRecords = new AjaxCall();
	ajColumns.doAjaxCall("columns", populateColumns);
	ajRecordCount.doAjaxCall("recordCount", updateRecordCounter);
	ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);

	// Get paging buttons
	let buttonFirst = document.getElementById('button-first');
	let buttonPrevious = document.getElementById('button-previous');
	let buttonNext = document.getElementById('button-next');
	let buttonLast = document.getElementById('button-last');

	// Assign button listeners to handle clicks
	buttonFirst.onclick = () => {
		ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);
	};
	buttonPrevious.onclick = () => {
		let previousStart = indexPos - pageSize - 1;
		if (previousStart < 0) ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);
		else ajRecords.doAjaxCall("records", updateGrid, previousStart, indexPos - 1);
	};
	buttonNext.onclick = () => {
		let nextFinish = indexPos + pageSize * 2 + 1;
		if (nextFinish >= totalRecords) ajRecords.doAjaxCall("records", updateGrid, totalRecords - pageSize - 1, totalRecords - 1);
		else ajRecords.doAjaxCall("records", updateGrid, indexPos + pageSize + 1, nextFinish);
	};
	buttonLast.onclick = () => {
		ajRecords.doAjaxCall("records", updateGrid, totalRecords - pageSize - 1, totalRecords - 1);
	};
};

