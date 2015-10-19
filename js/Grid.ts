class Grid {
	recordCountDiv: HTMLElement;
	recordCount: number;
	displaySize: number;
	startIndex: number;
	endIndex: number;
	urlString: string;	
	table: HTMLElement;

	constructor(element: HTMLElement) {
		this.recordCountDiv = document.getElementById('recordCount');
		this.recordCount = 0; // The total number of records being returned by the service
		this.displaySize = 25; // The number of records to be displayed per page
		this.startIndex = 0; // The first record to be displayed on a page
		this.endIndex = this.startIndex + this.displaySize; // The last record to be displayed on a page
		this.urlString = "http://localhost:2050/"; // The path to the API services
		this.table = document.getElementById('table');
		this.getRecordCount();
		this.getTableColumns();		
	}

	// This function initialised the grid when the page is loaded
	initGrid() {
		this.addDOMElements();
	}

	// This function refreshes the grid contents
	refresh() {		
		$("#tbody").empty();
		this.addDOMElements();
	}

	// This function will add the elements required to draw the grid on the page
	addDOMElements() {
		$("#recordCount").empty();
		this.recordCountDiv.innerHTML += "Number of records: " + this.recordCount;
		this.displayRecords();		
	}

	// This function will get all the table columns
	getTableColumns(): void {
		let url: string;
		let table: string;
		let self = this;		
		url = self.urlString + "columns";
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			success: function (data) {				
				$.each(data, function (i, item) {
					table += "<th id='theading'>" + item + "</th>";
				});
				$("#thead").append(table);				
			},
			error: function (message) {
				alert("Error => " + message);
			}
		});	
	}

	// This function displays the table records
	displayRecords(): void {
		let url: string;
		let displayRow: string;
		let self = this;
		url = self.urlString + "/records?from=" + self.startIndex + "&to=" + self.endIndex;
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			success: function (data) {				
				$.each(data, function (i, item) {
					displayRow += '<tr>'
					for (let ix in item) {
						displayRow += '<td>' + item[ix] + '</td>';
					}
					displayRow += '</tr>';
				});
				$("#tbody").append(displayRow);
			},
			error: function (message) {
				alert("Error => " + message);
			}
		});	
	}

	// This function gets the total record count
	getRecordCount(): void {
		let url: string;
		let self = this;
		url = self.urlString + "recordCount";
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			success: function (data) {				
				self.recordCount = data;
			},
			error: function (message) {
				alert("Error =>" + message);
			}
		});
	}
	
	// This function navigates to the first page of the records
	firstPage() {
		let self = this;
		self.startIndex = 0;
		self.endIndex = self.displaySize;	
		$("#prev").prop('disabled', true);
		$("#first").prop('disabled', true);
		$("#next").prop('disabled', false);
		$("#last").prop('disabled', false);	
		self.refresh();	
	}

	// This function navigates to the previous page of the records
	previousPage() {
		let self = this;
		let diffValue = self.startIndex - self.displaySize;
		if (!(diffValue <= 0))
			self.startIndex -= self.displaySize;
		else self.startIndex = 0;
		if (!(diffValue <= self.displaySize))
			self.endIndex -= self.displaySize;
		else self.endIndex = self.displaySize;		
		self.refresh();		
	}

	// This function navigates to the next page of the records
	nextPage() {
		let self = this;
		let addValue = self.startIndex + self.displaySize;
		let displayValue = self.recordCount - self.displaySize;
		if (!(addValue >= displayValue))
			self.startIndex += self.displaySize;
		else self.startIndex = displayValue;
		if (!(addValue >= (self.recordCount - 1)))
			self.endIndex += self.displaySize;
		else self.endIndex = (self.recordCount - 1);
		$("#prev").prop('disabled', false);
		$("#first").prop('disabled', false);			
		self.refresh();			
	}
	
	// This function navigates to the last page of the records
	lastPage() {
		let self = this;
		self.startIndex = self.recordCount - self.displaySize;
		self.endIndex = (self.recordCount - 1);
		$("#prev").prop('disabled', false);
		$("#first").prop('disabled', false);
		$("#next").prop('disabled', true);
		$("#last").prop('disabled', true);
		self.refresh();		
	}

	// This function is used to make the API calls to the service
	private getURL(url) {
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			success: function (data) {

			},
			error: function (message) {
				alert("Error => " + message);
			}			
		});
	}	
}

window.onload = () => {
	let tableGrid = document.getElementById('tableGrid');
	let grid = new Grid(tableGrid);
	$("#prev").prop('disabled', true);
	$("#first").prop('disabled', true);
	document.getElementById("prev").onclick = function () { grid.previousPage(); };
	document.getElementById("first").onclick = function () { grid.firstPage(); };
	document.getElementById("next").onclick = function () { grid.nextPage(); };
	document.getElementById("last").onclick = function () { grid.lastPage(); };
	grid.initGrid();
}