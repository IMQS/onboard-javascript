"use strict";
window.onload = () => {onloadValues() };

const rowHeight = 56;
let from = 0;
let to = 0;


function amountOfRowsThatFit(){
	let $buttonEl = $("button");

	let windowHeigt = window.innerHeight;
	let buttonDivheigth = $buttonEl.innerHeight;
	let adaptedHeight = windowHeigt-buttonDivheigth;

	return (adaptedHeight/rowHeight)-1;

}


function onloadValues(){
	let $to = $("toValue");
	let $from = $("toValue");
	callHeaders();
	from = 0;
	let rowsFittable =amountOfRowsThatFit();
	to = from+rowsFittable;

}


function pressedNext(){
	 callHeaders();
	 let $to = $("toValue");
	 let $from = $("toValue");
 
	 let rowsThatFit = amountOfRowsThatFit();

	from = ($to.value)+1;
     to = from+rowsThatFit;
 

}

function pressedPrevious(){
	//werk eers current from en to uit
	//temp = to - from 
	//from = from-fittable rows
	//flipp around for next
	//update label values
	callHeaders();
	let $to = $("toValue");
	let $from = $("toValue");
	let rowsThatFit = amountOfRowsThatFit();

	from = ($from.value)-rowsThatFit;
     to = from-1;
 

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

function retrieveRows() {
	let indexNumber = 0;

	//validate input
	let rowsRequest = new XMLHttpRequest;
	//Call the open function, GET-type of request,
	rowsRequest.open('GET', 'http://localhost:2050/records?from=' + from + '&to=' + to, true)

	let generateRows = () => {
		//check if the status is 200(means everything is okay)
		let columnData = Array.from(rowsRequest.responseText.split(','));

function pressedNext() {
	fittableRows = retrieveRowsThatCanFit();
	callHeaders();

}

function pressedPrevious() {
	fittableRows = retrieveRowsThatCanFit();
	callHeaders();


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
	retrieveRows();
}
