class Data {
	recordCount: number;
	columns: string[];
	numberOfColumns: number;
	dataSet: string[][];
	indexStart: number;
	dataRange: number;
	loadRange: number;

	constructor(dataRange: number, loadRange: number) {
		this.recordCount = this.getRecordCount();
		this.columns = this.getColumns();
		this.numberOfColumns = this.columns.length;
		//create empty data set
		this.dataSet = new Array(+this.recordCount + dataRange - 1); // Add dataRange to allow for checks to fall out of boundaries where needed in the updateData function
		for (var i = 0; i < (+this.recordCount + dataRange - 1); i++) {
			this.dataSet[i] = new Array<string>(this.numberOfColumns);
		}
		this.indexStart = 0;
		this.dataRange = dataRange;	// Displayd rows in table per page
		this.loadRange = loadRange;	// loadRrange >= 2*dataRange and loadRange is always an even number
	}

	updateData() {
		var positiveIndex: number = this.indexStart;
		if (this.dataSet[this.indexStart][0] === undefined || this.dataSet[this.indexStart + this.dataRange - 1][0] === undefined) { // Check if data set range is incomplete for next and back funtions
			if (this.indexStart - 1 >= 0) { // Used to check boundries for data loading
				positiveIndex = this.indexStart - 1;
			}
			if (this.dataSet[positiveIndex][0] === undefined && this.dataSet[this.indexStart + this.dataRange - 1][0] === undefined) { // Check if the data range is empty, then populate left and right of index
				var tempStart: number = this.indexStart - (this.loadRange / 2);
				var tempEnd: number = this.indexStart + (this.loadRange / 2);
				var originalIndex: number = this.indexStart;
				if (tempStart < 0) { // Prevent index to go below 0
					tempStart = 0;
				}
				if (tempEnd > this.recordCount - this.dataRange) {
					tempEnd = this.recordCount;
					this.indexStart = tempStart + 1;
				}
				var tempData: string[][] = this.getDataSet(tempStart, tempEnd - 1);	// Fetch data from server
				for (var i = tempStart, x = 0; i < tempEnd; i++ , x++) {
					for (var j = 0; j < this.numberOfColumns; j++) {
						this.dataSet[i][j] = tempData[x][j];	// Put fetched data into dataSet
					}
				}
				if (tempEnd === this.recordCount) {  // Set index back into range to see searched ID
					this.indexStart = originalIndex - this.dataRange + 1;
				}
			} else if (this.dataSet[this.indexStart - 1][0] === undefined) {	// Check if data at the start of the range is empty, then load data set to the left  
				var tempStart: number = this.indexStart + this.dataRange - 1 - this.loadRange;
				var tempEnd: number = this.indexStart + this.dataRange;
				if (tempStart < 0) { // Prevent index to go below 0
					tempStart = 0;
				}
				var tempData: string[][] = this.getDataSet(tempStart, tempEnd - 1);	// Fetch data from server
				for (var i = tempStart, x = 0; i < tempEnd; i++ , x++) {
					for (var j = 0; j < this.numberOfColumns; j++) {
						this.dataSet[i][j] = tempData[x][j];	// Put fetched data into dataSet
					}
				}
			} else if (this.dataSet[this.indexStart - 1 + this.dataRange][0] === undefined) {	// Check if data at the end of the range is empty, then load data set to the right
				var tempStart: number = this.indexStart;
				var tempEnd: number = this.indexStart + this.loadRange;
				var originalIndex: number = this.indexStart;
				if (tempEnd > this.recordCount - this.dataRange) { // Prevent index to go past record limit
					tempEnd = this.recordCount;
					this.indexStart = tempStart + 1;
				}
				var tempData: string[][] = this.getDataSet(tempStart, tempEnd - 1);	// Fetch data from server
				for (var i = tempStart, x = 0; i < tempEnd; i++ , x++) {
					for (var j = 0; j < this.numberOfColumns; j++) {
						this.dataSet[i][j] = tempData[x][j];	// Put fetched data into dataSet
					}
				}
				if (tempEnd === this.recordCount) { // Set index back into range to see searched ID
					this.indexStart = originalIndex - this.dataRange + 1;
				}
			}
		}
	}

	drawTable() {
        var tbl = document.getElementById('table');
		var tbdy = document.createElement('tbody');
		var index = document.getElementById('index');
		// Create colum header
		var tr = document.createElement('tr');
		for (var k = 0; k < this.numberOfColumns; k++) {
			var th = document.createElement('th');
			th.innerText = this.columns[k];
			tr.appendChild(th);
		}
		tbdy.appendChild(tr);
		// Create colum data
		for (var i = this.indexStart; i < this.indexStart + this.dataRange; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < this.numberOfColumns; j++) {
				var td = document.createElement('td');
				td.innerText = this.dataSet[i][j];
				tr.appendChild(td);
			}
			tbdy.appendChild(tr);
		}
		tbl.appendChild(tbdy);
		if (this.indexStart < this.dataRange) {
			document.getElementById('backBtn').classList.add("hide");
		} else {
			document.getElementById('backBtn').classList.remove("hide");
		}
		if (this.indexStart === this.recordCount - this.dataRange) {
			document.getElementById('nextBtn').classList.add("hide");
		} else {
			document.getElementById('nextBtn').classList.remove("hide");
		}
		index.textContent = ("Showing " + (this.indexStart+1) + " to " + (this.indexStart + this.dataRange) + " of " + this.recordCount + " records."); // Update data range counter on page
    }

	clearTable() {
		var tbl = document.getElementById('table');
		var tbody = document.getElementsByTagName('tbody');
		tbl.removeChild(tbody[0]); // Remove current table
	}

	getRecordCount() {
		var xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open("GET", "http://localhost:2050/recordCount", false);
		xhr.send();
		return xhr.response;
	}

	getColumns() {
		var xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open("GET", "http://localhost:2050/columns", false);
		xhr.send();
		return JSON.parse(xhr.response);
	}

	getDataSet(begin: number, end: number) {
		var xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open("GET", "http://localhost:2050/records?from=" + begin + "&to=" + end, false);
		xhr.send();
		return JSON.parse(xhr.response);
	}
}

window.onload = () => {
	var data: Data = new Data(40, 320);
	data.updateData();
	data.drawTable();
	document.getElementById("backBtn").addEventListener("click", function () {
		if (data.indexStart >= data.dataRange) {
			data.indexStart = data.indexStart - data.dataRange;
			data.updateData();
			data.clearTable();
			data.drawTable();
		}
	});
	document.getElementById("nextBtn").addEventListener("click", function () {
		if (data.indexStart < data.recordCount - data.dataRange) {
			data.indexStart = data.indexStart + data.dataRange;
			data.updateData();
			data.clearTable();
			data.drawTable();
		}
	});
	document.getElementById("findBtn").addEventListener("click", function () {
		if (+document.getElementsByTagName("input")[0].value >= 0 && +document.getElementsByTagName("input")[0].value < data.recordCount) {
			data.indexStart = +document.getElementsByTagName("input")[0].value;
			data.updateData();
			data.clearTable();
			data.drawTable();
		}
	});
};