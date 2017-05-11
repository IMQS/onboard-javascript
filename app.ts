/// <reference path="scripts/typings/jquery/jquery.d.ts" />

class RecordsApp {
	numberOfItems: number;
	baseUrl = "http://localhost:2050/";
	fromCount: number;
	toCount: number;

	constructor(fromCount: number, toCount: number) {
		this.fromCount = fromCount;
		this.toCount = toCount;
	}

	// Load all columns returned from the server
	private loadColumns(data) {
		const header = document.createElement("thead");
		const headerRow = document.createElement("tr");

		// Add data items to the row
		$.each(data,
			(key, val) => {
				const headerItem = document.createElement("th");
				headerItem.innerHTML = String(val);
				header.appendChild(headerItem);
			});

		header.appendChild(headerRow);
		$("#recordsTable").append(header);
	}

	// Process and render data coming from the server
	private loadRecords(data) {
		// Clear the table body before adding new content
		$("#recordsTable > tbody").empty();

		// Add data items to the row
		$.each(data,
			(key, val) => {
				const rowData = val as Array<any>;
				let tableRowHtml = "<tr>";
				for (let i = 0; i < rowData.length; i++) {
					tableRowHtml += `<td>${rowData[i]}</td>`;
				}
				tableRowHtml += "</tr>";
				$("#recordsTable > tbody").append(tableRowHtml);
			});
	}

	// Pass number of records from the server to a hidden field on the front end
	private getRecordsCount(data) {
		$("#recordsCount").text(Number(data));
	}

	// Get records from server
	getRecords() {
		const recordCounts = Number($("#recordsCount").text());

		if ((recordCounts !== 0) && (this.toCount >= recordCounts) && (this.fromCount < recordCounts)) {
			$.getJSON(this.baseUrl + "/records?from=" + this.fromCount + "&to=" + (recordCounts - 1),
				(response) => {
					this.loadRecords(response);
				});
		} else {
			$.getJSON(this.baseUrl + "/records?from=" + this.fromCount + "&to=" + this.toCount,
				(response) => {
					this.loadRecords(response);
				});
		}
	}

	// Get all columns from the server
	getColumns() {
		$.getJSON(this.baseUrl + "/columns",
			(response) => {
				this.loadColumns(response);
			});
	}

	// Get number of records from server
	getRecordCount() {
		$.get(this.baseUrl + "/recordCount",
			(response) => {
				this.getRecordsCount(response);
			});
	}

}