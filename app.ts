/// <reference path="./third_party/jquery.d.ts" />

let rowNum = 0;
let table: Table;
let timeout = 0;
let maxRecords = 0;
let NumToFetch: number = 0;
let searchedId = -1;

class Table {
	table
	tableHead;
	tableBody;

	constructor() {
		this.table = <HTMLTableElement>document.getElementById('mainTable');
		this.tableHead = this.table.createTHead();
		this.tableBody = this.table.createTBody();

		let bold = document.createElement('b');
		let title = document.createTextNode("Search ID:");
		bold.appendChild(title);
		this.table.appendChild(bold);

		let searchField = document.createElement("input");
		searchField.id = "search";
		searchField.type = 'number';
		searchField.min = "0";
		searchField.oninput = search;
		this.table.appendChild(searchField);
	}

	getHead() {
		return this.tableHead;
	}

	update(data) {
		let newTableBody = document.createElement('tbody');

		let row;
		for (let i = 0; i < data.length; i++) {
			row = new Row(newTableBody, i);
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

			if (values[0] == searchedId) {
				cell.innerHTML = "<b>" + values[i] + "</b>";
			} else {
				cell.innerHTML = values[i];
			}
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

	$.get("http://localhost:2050/recordCount", function (data) {
		maxRecords = data - 1;
		$(window).resize();
	});

	$.getJSON("http://localhost:2050/columns", function (data) {
		tableHead.makeColumnHeadings(data);
	});

	$(window).resize(function () {		
		clearTimeout(timeout);

		timeout = setTimeout(resize, 250);
	});
	
	createNavigation();
};

function createNavigation() {
	let footer = document.getElementById('mainFooter');

	let downButton = document.createElement('button');
	let upButton = document.createElement('button');
	
	let imgDown = document.createElement('img');
	let imgUp = document.createElement('img');

	imgDown.setAttribute('src', "icons/button_down.png");
	imgUp.setAttribute('src', "icons/button_up.png");

	downButton.appendChild(imgDown);
	upButton.appendChild(imgUp);

	downButton.onclick = moveDown;
	upButton.onclick = moveUp;

	footer.appendChild(downButton);
	footer.appendChild(upButton);
}

function resize() {
	NumToFetch = Math.floor((window.innerHeight - (41 + 30)) / 24) - 1;

	if (NumToFetch < 0) {
		table.update([]);
		return;
	}

	if (rowNum < 0) {
		rowNum = 0;
	}

	if (rowNum + NumToFetch > maxRecords) {
		rowNum -= rowNum + NumToFetch - maxRecords;

		if (rowNum < 0) {
			rowNum = 0;
			NumToFetch = maxRecords;
		}
	}

	$.getJSON("http://localhost:2050/records", { from: rowNum, to: rowNum + NumToFetch },
		function (data) {
			table.update(data);
		});
}

function search() {
	let searchField: HTMLInputElement = <HTMLInputElement>document.getElementById('search');
	let value: number = +searchField.value;

	if (value < 0 || value > maxRecords) {
		return;
	}

	searchedId = value;
	rowNum = value - Math.floor(((window.innerHeight - (41 + 30)) / 24 - 1) / 2);

	resize();
}

function moveDown() {
	if (rowNum + NumToFetch == maxRecords) {
		return;
	}

	rowNum++;

	resize();
}

function moveUp() {
	if (rowNum == 0) {
		return;
	}

	rowNum--;

	resize();
}