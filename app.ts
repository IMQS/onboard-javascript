"use strict";
window.onload = () => { retrieveRows(1) };
let from = 0;
let to = 13;

let resizeBody = () => {
	let $thElement = $("th");
	let $tdElement = $("td");
	let $trElement = $("tr");
	let $tableElement = $("table");

	let elWidth = window.innerWidth;

	$trElement.css({
		'width': elWidth + "px"
	})

	$thElement.css({
		'width': elWidth / 11 + "px"
	})

	$tdElement.css({
		'width': elWidth / 11 + "px"

	})

	$tableElement.css({
		'width': elWidth + "px"
	})

	//remove unnecesary rows
	let trRows = $("tr").toArray();
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
		to = 13
	} else if (number == 2) {
		if (from == 0) {
			from = 0;
			to = 13;
		} else {
			from = from - 13;
			to = to - 13;
		}
	} else if (number == 3) {
		if (to == 10000) {
			from = 9987;
			to = 10000;
		} else {
			from = from + 13;
			to = to + 13;
		}
	} else if (number == 4) {
		let fromValue = <HTMLInputElement>document.getElementById("fromValue");
		from = parseInt(fromValue.value);
		console.log("From value: " + from);
		to = from + 12;
	}

	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	rowsRequest.open('GET', 'http://localhost:2050/records?from=' + from + '&to=' + to, true)

	let generateRows = () => {
		//check if the status is 200(means everything is okay)
		let columnData = Array.from(rowsRequest.responseText.split(','));

		for (let j = 1; j < 15; j++) {
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
	let tableRetrieved = <HTMLInputElement>document.getElementById("intialTable");
	console.log(tableRetrieved);
	if (tableRetrieved != null) {
		tableRetrieved.remove();
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
