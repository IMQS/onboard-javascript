"use strict";
let from = 0;
let to = 12;


function resizeBody() {
	let $thElement = $("th");
	let $tdElement = $("td");
	let $trElement = $("tr");
	let $tableElement = $("table");
	let $btnElement = $("button");

	let elHeight = window.outerHeight;
	let adaptedHeigth = elHeight - ($btnElement.height());
	let elWidth = window.outerWidth;

	let trArray = trEl

	$btnElement.css({
		'height': elHeight / 30 + "px",
		'font-size': elHeight / 65 + "px",
		'width': elWidth / 13 + "px",
	})

	$trElement.css({
		'height': "auto",
		'font-size': adaptedHeigth / 28 + "px",
		'width': elWidth + "px"
	})

	$thElement.css({
		'width': elWidth / 11.45 + "px",
		'padding': "0px",
		'height': (adaptedHeigth / 100) * 5.5 + "px",
		'font-size': adaptedHeigth / 50 + "px"

	})

	$tdElement.css({
		'width': elWidth / 11.45 + "px",
		'padding': "0px",
		'height': (adaptedHeigth / 100) * 5.5 + "px",
		'font-size': adaptedHeigth / 60 + "px"
	})

	$tableElement.css({
		'width': elWidth + "px",
		'padding': "0px",
		'margin': "0px",
	})




}

//retrieves column names
function callHeaders() {
	let xhr = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	xhr.open('GET', 'http://localhost:2050/columns', true)
	//call the onload
	xhr.onload = function () {
		//check if the status is 200(means everything is okay)
		if (this.status === 200) {
			create(Array.from(JSON.parse(this.responseText)));
		}
	}
	//call send
	xhr.send();

}

function retrieveRows(number) {
	let indexNumber = 0;
	if (number == 1) {
		from = 0;
		to = 12
	} else if (number == 2) {
		if (from == 0) {
			from = 0;
			to = 12;
		} else {
			from = from - 12;
			to = to - 12;
		}
	} else if (number == 3) {
		if (to == 10000) {
			from = 9988;
			to = 10000;
		} else {
			from = from + 12;
			to = to + 12;
		}
	}

	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	rowsRequest.open('GET', 'http://localhost:2050/records?from=' + from + '&to=' + to, true)

	let generateRows = () => {
		//check if the status is 200(means everything is okay)
		let columnData = Array.from(rowsRequest.responseText.split(','));

		for (let j = 0; j < 13; j++) {
			let newRow = document.createElement('tr');
			newRow.setAttribute('id', 'rowNumber' + j);
			document.getElementById("intialTable").appendChild(newRow);

			for (let i = 0; i < 11; i++) {
				let columnName = document.createElement('td');
				columnName.textContent = columnData[indexNumber].replace(/[`~!@#$%^&*()_|=+;:'",.<>\{\}\[\]\\\/]/gi, '');
				document.getElementById("rowNumber" + j).appendChild(columnName);

				indexNumber++;
			}
		}
	}
	//call the onload
	rowsRequest.onload = generateRows;
	//call send
	rowsRequest.send();
}

function create(items) {
	if (document.getElementById("intialTable") != null) {
		document.getElementById("intialTable").remove();
	}

	let table = document.createElement('table');
	table.setAttribute('id', 'intialTable');
	document.getElementById("body").appendChild(table);

	let newRow = document.createElement('tr');
	newRow.setAttribute('id', 'rowNumber');
	document.getElementById("intialTable").appendChild(newRow);

	for (let i = 0; i < items.length; i++) {
		let columnName = document.createElement('th');
		columnName.textContent = items[i]
		columnName.setAttribute('id', 'th');
		document.getElementById("rowNumber").appendChild(columnName);
	}
}

function readIndex() {
	callHeaders();
	retrieveRows(1);
}

function readPrevious() {
	callHeaders();
	retrieveRows(2);
}

function readNext() {
	callHeaders();
	retrieveRows(3);
}


window.onload = readIndex();
window.onresize = () => { resizeBody() };
