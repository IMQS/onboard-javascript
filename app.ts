"use strict";
window.onload = () => { callHeaders() };
const rowHeigth = 56;
let fittableRows = 0;


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

function retrieveRowsThatCanFit() {
	//figure out how many rows can fit on the screen
	let elHeight = window.innerHeight;
	console.log("Window:" + elHeight);

	let buttonEl = document.getElementById("buttons");
	console.log("Button:" + buttonEl!.clientHeight);

	let adaptedHeigth = elHeight - buttonEl!.clientHeight;
	console.log("Adapted height:" + adaptedHeigth);
	console.log("fittable:" + Math.floor(adaptedHeigth / rowHeigth));

	return Math.floor(adaptedHeigth / rowHeigth) - 1;

}

function pressedNext() {
	fittableRows = retrieveRowsThatCanFit();
	callHeaders();

}

function pressedPrevious() {
	fittableRows = retrieveRowsThatCanFit();
	callHeaders();

}

function pressedSubmit() {
	let fromValue = <HTMLInputElement>document.getElementById("fromValue");
	if (/[0-9]/.test(fromValue.value) == false) {
		window.alert("Nee,Stout \(>.<)/");
	} else {
		callHeaders();
	}

}


function create(input: string[]) {
	//create table
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


	let indexNumber = 0;
	let fittableRows = retrieveRowsThatCanFit();
	let fromValue = <HTMLInputElement>document.getElementById("fromValue");
	let from = parseInt(fromValue.value);
	console.log("From:" + from);
	let to = from + fittableRows;;
	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	rowsRequest.open('GET', 'http://localhost:2050/records?from=' + from + '&to=' + to, true)

	let generateRows = () => {
		//check if the status is 200(means everything is okay)
		let columnData = Array.from(rowsRequest.responseText.split(','));

		for (let j = 1; j < fittableRows; j++) {
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
	rowsRequest.send()
}
