/// <reference path="./third_party/jquery.d.ts" />

let rowNum = 0;
let table: Table;
let timeout = 0;

class Table {
	table
	tableHead;
	tableBody;

	constructor() {
		this.table = <HTMLTableElement>document.getElementById("mainTable");
		this.tableHead = this.table.createTHead();
		this.tableBody = this.table.createTBody();
	}

	getHead() {
		return this.tableHead;
	}

	update(data) {
		let newTableBody = document.createElement('tbody');

		let row;
		for (let i = 0; i < data.length; i++) {
			row = new Row(newTableBody, rowNum + i);
			row.addRow(data[i]);
		}

		this.tableBody.parentNode.replaceChild(newTableBody, this.tableBody);
		this.tableBody = newTableBody;
	}
}

class Row {
	tableBody;
	index;

	constructor(body, index) {
		this.tableBody = body;
		this.index = index;
	}

	addRow(values = []) {
		let row = this.tableBody.insertRow(this.index);

		let cell;
		for (let i = 0; i < values.length; i++) {
			cell = row.insertCell(i);
			cell.innerHTML = values[i];
		}
	}
}

class Headings {
	tableHead;

	constructor(head) {
		this.tableHead = head;
	}

	makeColumnHeadings(headings: string[]) {
		let row = this.tableHead.insertRow(0);

		let cell;
		for (let i = 0; i < headings.length; i++) {
			cell = row.insertCell(i);
			cell.innerHTML = "<b>" + headings[i] + "</b>";
		}
	}
}

window.onload = () => {

	table = new Table();
	let tableHead = new Headings(table.getHead());
	
	$.getJSON("http://localhost:2050/columns", function (data) {
		tableHead.makeColumnHeadings(data);
	});

	$(window).resize(function () {		
		clearTimeout(timeout);

		timeout = setTimeout(resize, 250);
	});

	$(window).resize();
};

function resize() {
	let NumToFetch: number = 0;

	NumToFetch = Math.floor((window.innerHeight - 41) / 24) - 1;

	if (NumToFetch < 0) {
		table.update([]);
		return;
	}

	$.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch },
		function (data) {
			table.update(data);
		});
}