let totalRecords = 0;
let indexPos = 0;

class AjaxCall {
	private url: string = "http://localhost:2050";
	private indexStart: number;
	private indexFinish: number;
	private fullQuery: string;
	private request: string;
	private objHttpReq: any;

	doAjaxCall(request: string, callback: Function, start?: number, finish?: number) {
		this.request = request;
		this.indexStart = start;
		this.indexFinish = finish;
		if (start >= 0) {
			this.fullQuery = `${this.url}/${request}?from=${start}&to=${finish}`;
		}
		else { this.fullQuery = this.url + "/" + request; }
		this.objHttpReq = new XMLHttpRequest();
		this.objHttpReq.onreadystatechange = () => this.onRStateChange(callback);
		this.objHttpReq.open("Get", this.fullQuery, true);
		this.objHttpReq.send();
	}

	private onRStateChange(callback: Function) {
		if (this.objHttpReq.readyState === XMLHttpRequest.DONE) {
			if (this.objHttpReq.status === 200) {
				let data = JSON.parse(this.objHttpReq.responseText);
				(callback)(data, this.indexStart, this.indexFinish);
			}
			else {
				console.log("AJAX error with the following status occurred: " + this.objHttpReq.status);
			}
		}
	}
}

// Create table header row based on columns received
function populateColumns(columns: JSON) {
	let columnArray = Object.keys(columns).map((k) => { return columns[k]; });
	const htmlTable = document.getElementById("table-header");
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
	totalRecords = +recordCount;
	document.getElementById("page-total").innerHTML = recordCount.toString();
}

// Update table with content received from API call
function updateGrid(records: JSON, start: number, finish: number) {
	indexPos = start;
	document.getElementById("page-progress").innerHTML = `Displaying ${start} to ${finish} of `;
	let recordArray = Object.keys(records).map((k) => { return records[k]; });
	const tableContent = document.getElementById("table-body");
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
	// Enable all buttons on successful ajax return
	const allButtons = document.getElementsByClassName("nav-button");
	for (let x = 0; x < allButtons.length; x++) {
		allButtons[x].removeAttribute("disabled");
	};
}

window.onload = () => {
	// Get brower height and calculate number of rows to display
	let browserHeight = window.innerHeight - 205;
	let pageSize = Math.floor(browserHeight / 33);
	let resizeTimer;

	// Initialise Ajax calls and retrieve initial data
	const ajColumns = new AjaxCall();
	const ajRecordCount = new AjaxCall();
	const ajRecords = new AjaxCall();
	ajColumns.doAjaxCall("columns", populateColumns);
	ajRecordCount.doAjaxCall("recordCount", updateRecordCounter);
	ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);

	// Get paging buttons
	const buttonFirst = document.getElementById('button-first');
	const buttonPrevious = document.getElementById('button-previous');
	const buttonNext = document.getElementById('button-next');
	const buttonLast = document.getElementById('button-last');

	// Assign button listeners to handle clicks, disables button on click
	buttonFirst.onclick = () => {
		buttonFirst.setAttribute("disabled", "disabled");
		ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);
	};
	buttonPrevious.onclick = () => {
		buttonPrevious.setAttribute("disabled", "disabled");
		const previousStart = indexPos - pageSize - 1;
		if (previousStart < 0) {
			ajRecords.doAjaxCall("records", updateGrid, 0, pageSize);
		}
		else {
			ajRecords.doAjaxCall("records", updateGrid, previousStart, indexPos - 1);
		}
	};
	buttonNext.onclick = () => {
		buttonNext.setAttribute("disabled", "disabled");
		const nextFinish = indexPos + pageSize * 2 + 1;
		if (nextFinish >= totalRecords) {
			ajRecords.doAjaxCall("records", updateGrid, totalRecords - pageSize - 1, totalRecords - 1);
		}
		else {
			ajRecords.doAjaxCall("records", updateGrid, indexPos + pageSize + 1, nextFinish);
		}
	};
	buttonLast.onclick = () => {
		buttonLast.setAttribute("disabled", "disabled");
		ajRecords.doAjaxCall("records", updateGrid, totalRecords - pageSize - 1, totalRecords - 1);
	};

	// Adjust amount of rows to display and request data from server
	window.onresize = () => {
		// Timer to wait for resize to complete
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			browserHeight = window.innerHeight - 205;
			pageSize = Math.floor(browserHeight / 33);
			if ((indexPos + pageSize) >= totalRecords) {
				ajRecords.doAjaxCall("records", updateGrid, totalRecords - pageSize - 1, totalRecords - 1);
			}
			else {
				ajRecords.doAjaxCall("records", updateGrid, indexPos, indexPos + pageSize);
			}
		}, 150);
	}
};

