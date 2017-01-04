/// <reference path="./third_party/jquery.d.ts" />

let rowNum = 0;
let table: Table;

class Table {
	tableHead;
	tableBody;

	constructor() {
		let table = <HTMLTableElement>document.getElementById("mainTable");
		this.tableHead = table.createTHead();
		this.tableBody = table.createTBody();
	}

	getHead() {
		return this.tableHead;
	}

	getBody() {
		return this.getBody;
	}

	update(data) {
		let row;
		for (let i = 0; i < data.length; i++){
			row = new Row(this.tableBody, rowNum + i);
			row.addRow(data[i]);
		}
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
			cell.innerHTML = "<b>" + headings[i] + "<b>";
		}
	}
}

window.onload = () => {

	table = new Table();
	let tableHead = new Headings(table.getHead());
	let NumToFetch: number = 0;

	NumToFetch = Math.floor(window.innerHeight / 25) - 1;
	
	$.getJSON("http://localhost:2050/columns", function (data) {
		tableHead.makeColumnHeadings(data);
	});

	$.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch },
		function (data) {
			table.update(data);
		});	
};

window.onresize = function (event) {
    
};