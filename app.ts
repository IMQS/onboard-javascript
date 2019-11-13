"use strict";
window.onload = () => { retrieveRows(1) };
let from = 0;
let to = 12;


let resizeBody = () => {
	let $thElement = $("th");
	let $tdElement = $("td");
	let $trElement = $("tr");
	let $tableElement = $("table");
	let $btnElement = $("button");
	let $lblElement = $("label");
	let $inputElement = $("input");

	let elHeight = window.outerHeight;
	let adaptedHeigth = elHeight - ($btnElement.height()!);
	let elWidth = window.outerWidth;



	$btnElement.css({
		'height': elHeight / 30 + "px",
		'font-size': elHeight / 65 + "px",
		'width': elWidth / 13 + "px",
	})

	$lblElement.css({
		'height': elHeight / 30 + "px",
		'font-size': elHeight / 65 + "px",
		'width': elWidth / 13 + "px",
	})

	$inputElement.css({
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
		'width': elWidth / 11.20 + "px",
		'padding': "0px",
		'height': (adaptedHeigth / 100) * 6 + "px",
		'font-size': adaptedHeigth / 50 + "px"

	})

	$tdElement.css({
		'width': elWidth / 11.20 + "px",
		'padding': "0px",
		'height': (adaptedHeigth / 100) * 6 + "px",
		'font-size': adaptedHeigth / 60 + "px"
	})

	$tableElement.css({
		'width': elWidth + "px",
		'padding': "0px",
		'margin': "0px",
	})

	//remove unnecesary rows
	let trRows = $("tr").toArray();
	let initialTable: HTMLElement | null = document.getElementById('initialTable');
	try {
		jQuery.each(trRows, function (tr) {


			let row = document.getElementById("rowNumber" + tr)!;

			let bounding = row.getBoundingClientRect();

			if (bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) && row != null) {
				document.getElementById("rowNumber" + tr)!.style.display = "block";
			} else {
				document.getElementById("rowNumber" + tr)!.style.display = "none";;
			}

		});
	} catch (Error) {
		console.log("Oof")

	}

}

//retrieves column names
function callHeaders() {
	console.log("headers called");
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

function retrieveRows(number: number) {
	callHeaders();
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
	} else if (number == 4) {
		from = parseInt((<HTMLInputElement>document.getElementById("myValue")).value);
		console.log(from);
		to = from + 12;

	}

	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	rowsRequest.open('GET', 'http://localhost:2050/records?from=' + from + '&to=' + to, true)

	let generateRows = () => {
		//check if the status is 200(means everything is okay)
		let columnData = Array.from(rowsRequest.responseText.split(','));

		for (let j = 1; j < 14; j++) {
			let newRow: HTMLElement = document.createElement('tr');
			newRow.setAttribute('id', 'rowNumber' + j);
			document.getElementById("intialTable")!.appendChild(newRow);

			for (let i = 0; i < 11; i++) {
				let columnName = document.createElement('td');
				columnName.textContent = columnData[indexNumber].replace(/[`~!@#$%^&*()_|=+;:'",.<>\{\}\[\]\\\/]/gi, '');
				document.getElementById("rowNumber" + j)!.appendChild(columnName);

				indexNumber++;
			}
		}
	}
	//call the onload
	rowsRequest.onload = generateRows;
	//call send
	rowsRequest.send();



}

function create(input: string[]) {
	if (document.getElementById("intialTable") != null) {
		let table = document.getElementById("intialTable");

	}

	let table = document.createElement('table');
	table.setAttribute('id', 'intialTable');
	document.getElementById("body")!.appendChild(table);

	let newRow = document.createElement('tr');
	newRow.setAttribute('id', 'rowNumber0');
	document.getElementById("intialTable")!.appendChild(newRow);

	for (let i = 0; i < input.length; i++) {
		let columnName = document.createElement('th');
		columnName.textContent = input[i]
		columnName.setAttribute('id', 'th');
		document.getElementById("rowNumber0")!.appendChild(columnName);
	}
}



window.onresize = resizeBody;
