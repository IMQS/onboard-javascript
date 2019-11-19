"use strict";
window.onload = () => { onloadValues() };
window.onresize = () => { fromAndToValuesAdjustment() };

const rowHeight = 62;
let from = 0;
let to = 0;
let fittableRows = 0;

/**
 * calculates the amount of rows that can fit on the screen given its current height
*/
function amountOfRowsThatFit() {

	let buttonEl = (<HTMLInputElement>document.getElementById("previousPage"))

	let windowHeigt = window.innerHeight;
	let buttonDivheigth = 67;
	let adaptedHeight = windowHeigt - buttonDivheigth;

	return Math.floor((adaptedHeight / rowHeight) - 1);

}

/**
*These are the starting values for when the screen loads
*/
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

/**
 *Adjust the values in the start and end boxes according to the screen heigth whenever it resizes
 */
function fromAndToValuesAdjustment() {
	var timeout;
	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(() => {
		let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
		let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;

		from = parseInt(fromValue);
		let rowsThatFit = amountOfRowsThatFit();
		to = from + rowsThatFit;

		if (to > 100000) {
			window.alert("Nee, stout >.<,your search has exceeded the maximum rows")
			from = 100000 - rowsThatFit;
			to = 100000;
		} else if (from < 0) {
			window.alert("Nee, stout >.<,your search has exceeded the minimum rows")
			from = 0;
			to = from + rowsThatFit;
		}
		fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
		toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
		callHeaders(from, to);
	}, 200);
}
/**
 *Executes when the user presses the next button
 */
function pressedNext() {

	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;

	let rowsThatFit = amountOfRowsThatFit();

	from = parseInt(toValue) + 1;
	to = from + rowsThatFit;

	if (to > 100000) {
		window.alert("Nee, stout >.<,your search has exceeded the maximum rows")
		from = 100000 - rowsThatFit;

		to = 100000;
	}
	fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
	toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();


	callHeaders(from, to);
}
/**
 *Executes when the user presses the previous button
 */
function pressedPrevious() {

	let toValue = (<HTMLInputElement>document.getElementById("toValue")).value;
	let fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value;
	let rowsThatFit = amountOfRowsThatFit();

	to = from - 1;
	from = parseInt(fromValue) - rowsThatFit;
	if (from <= -1) {
		window.alert("Nee, stout >.<,your search has exceeded the minimum rows")
		from = 0;
		to = from + rowsThatFit;
	}
	fromValue = (<HTMLInputElement>document.getElementById("fromValue")).value = from.toString();
	toValue = (<HTMLInputElement>document.getElementById("toValue")).value = to.toString();
	callHeaders(from, to);

}


/**
 *Retrieves column names
*/
function callHeaders(from: number, to: number) {
	fetch('http://localhost:2050/columns')
		.then((resp) => {
			return resp.json();
		})
		.then((columnsRequest) => {
			let headerData = <string[]>columnsRequest;
			create(headerData);
			retrieveRows(from, to);
		});
}

/**
 *Retrieves the table rows with data
 */
function retrieveRows(from: number, to: number) {
	let indexNumber = 0;
	let j = 1;

	fetch('http://localhost:2050/records?from=' + from + '&to=' + to)
		.then((resp) => {

			return resp.json();
		})
		.then((rowsRequest) => {

			let columnData = <string[]>rowsRequest;

			columnData.forEach(function (item) {
				let newRow: HTMLElement = document.createElement('tr');
				newRow.setAttribute('id', 'rowNumber' + j);
				document.getElementById("intialTable")!.appendChild(newRow);
				let content = Array.from(item);
				content.forEach(function (index) {
					let columnName = document.createElement('td');
					columnName.textContent = index;
					document.getElementById("rowNumber" + j)!.appendChild(columnName);

					indexNumber++;
				});
				j++;
			});
		});




}

function create(input: string[]) {
	//create table
	let tableRetrieved = <HTMLInputElement>document.getElementById("intialTable");
	if (tableRetrieved != null) {
		tableRetrieved.remove();
	}
	const table = document.createElement('table');
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
