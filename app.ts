"use strict";
window.onload = () => { onloadValues() };
window.onresize = () => { fromAndToValuesAdjustment() };

const rowHeight = 56 + 5;
let from = 0;
let to = 0;
let fittableRows = 0;

//calculates the amount of rows that can fit on the screen given its current height
function amountOfRowsThatFit() {
	let buttonEl = (<HTMLInputElement>document.getElementById("previousPage"))

	let windowHeigt = window.innerHeight;
	let buttonDivheigth = 57;
	let adaptedHeight = windowHeigt - buttonDivheigth;

	return Math.floor((adaptedHeight / rowHeight) - 1);

}

//these are the starting values for when the screen loads
function onloadValues() {
	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;

	from = 0;
	fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
	let rowsFittable = amountOfRowsThatFit();
	to = from + rowsFittable;
	toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
	callHeaders(from, to);
}

//adjust the values in the start and end boxes according to the screen heigth whenever it resizes
function fromAndToValuesAdjustment() {
	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;

	from = parseInt(fromValue);
	let rowsThatFit = amountOfRowsThatFit();
	to = from + rowsThatFit;


	if (to >= 1000000) {
		window.alert("Nee, stout >.<,your search has exceeded the maximum rows")
	} else {
		fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
		toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
		callHeaders(from, to);
	}
}

//executes when the user presses the next button
function pressedNext() {

	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;

	let rowsThatFit = amountOfRowsThatFit();

	from = parseInt(toValue) + 1;
	to = from + rowsThatFit;

	if (to > 1000000) {
		window.alert("Nee, stout >.<,your search has exceeded the maximum rows")
	} else {
		fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
		toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
		callHeaders(from, to);
	}
}

//executes when the user presses the previous button
function pressedPrevious() {

	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;
	let rowsThatFit = amountOfRowsThatFit();

	to = from - 1;
	from = parseInt(fromValue) - rowsThatFit;
	if (from <= -1) {
		window.alert("Nee, stout >.<,your search has exceeded the minimum rows")
	} else {
		fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
		toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
		callHeaders(from, to);
	}
}



//retrieves column names
function callHeaders(from: number, to: number) {

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
	retrieveRows(from, to);
}

//retrieves the table rows with data
function retrieveRows(from: number, to: number) {
	let indexNumber = 0;


	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	console.log(from + " : " + to)
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
}
