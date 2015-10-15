class OnboardingGrid {
    mainDiv: HTMLElement;
	headingDiv: HTMLElement;
	hostString: string;
	recCount: number;
	pageSize: number;
	pageBegin: number;
	pageEnd: number;
    
    constructor(element: HTMLElement) {
        this.mainDiv = element;
		this.headingDiv = document.getElementById('headings');
		this.hostString = "http://localhost:2050/";
		this.recCount = 0;
		this.pageSize = 35;
		this.pageBegin = 0;
		this.pageEnd = this.pageBegin + this.pageSize;
		this.getRecordCount();
		this.getColumnHeaders();				
    }

    start() {
        this.addDOMElements();		
    }

	addDOMElements() {
		$('#headings').empty();
		let header1: HTMLElement;		
		header1 = document.createElement('h1');
		header1.innerHTML += "Grid for onboarding...";
		this.headingDiv.appendChild(header1);		
		this.headingDiv.innerHTML += "Record Count: " + this.recCount;
		this.getAllData();				
	}

	getRecordCount() {
		let getURL: string;
		let self = this;
		getURL = self.hostString + "recordCount"; 
		$.ajax({
			url: getURL,
			type: 'GET',
			dataType: 'json',
			async: false,
			success: function (records) {
				self.recCount = records;
			},
			error: function (msg) {
				alert("Error: " + msg)
			}
		});		
	}

	getColumnHeaders() {
		let getURL: string;
		let self = this;
		getURL = self.hostString + "columns";
		$.ajax({
			url: getURL,
			type: 'GET',
			dataType: 'json',
			async: false,
			success: function (columns) {
				let headers: string = "";
				$.each(columns, function (key, value) {
					headers += "<th>" + value + "</th>";
				});
				$('#tableHead').append(headers);								
			},
			error: function (msg) {
				alert("Error: " + msg);
			}
		});
	}

	getAllData() {
		let getURL: string;
		let self = this;
		getURL = self.hostString + "records?from=" + self.pageBegin + "&to=" + self.pageEnd;
		$.ajax({
			url: getURL,
			type: 'GET',
			dataType: 'json',
			success: function (rows) {
				let row: string;
				$.each(rows, function (key, rowItem) {
					row = "";
					row += "<tr>";
					$.each(rowItem, function (key, columnItem) {
						row += "<td>" + columnItem + "</td>";
					});
					row += "</tr>";
					$('#tableBody').append(row);
				});
			},
			error: function(msg) {
				alert("Error: " + msg);
			}
		});
	}

	nextPage() {
		let self = this;
		if (!((self.pageBegin + self.pageSize) >= (self.recCount - self.pageSize)))
			self.pageBegin += self.pageSize;
		else self.pageBegin = self.recCount - self.pageSize;
		if (!((self.pageEnd + self.pageSize) >= (self.recCount-1)))
			self.pageEnd += self.pageSize
		else self.pageEnd = (self.recCount-1);
		self.refresh();
	}

	previousPage() {
		let self = this;
		if (!((self.pageBegin - self.pageSize) <= 0))
			self.pageBegin -= self.pageSize
		else self.pageBegin = 0;
		if (!((self.pageEnd - self.pageSize) <= self.pageSize))
			self.pageEnd -= self.pageSize
		else self.pageEnd = self.pageSize;
		self.refresh();
	}

	beginPage() {
		let self = this;
		self.pageBegin = 0;
		self.pageEnd = self.pageSize;
		self.refresh();
	}

	endPage() {
		let self = this;
		self.pageBegin = self.recCount - self.pageSize;
		self.pageEnd = (self.recCount-1);
		self.refresh();
	}

	refresh() {
		$('#tableBody').empty();
		this.addDOMElements();
	}
}

window.onload = () => {
    let divEl = document.getElementById('content');
    let grid = new OnboardingGrid(divEl);
	document.getElementById('nextBtn').onclick = function () { grid.nextPage() };
	document.getElementById('previousBtn').onclick = function () { grid.previousPage() };
	document.getElementById('beginBtn').onclick = function () { grid.beginPage() };
	document.getElementById('endBtn').onclick = function () { grid.endPage() };
    grid.start();
};