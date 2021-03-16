function getColumnData(): string[] {
	let headerArray: string[];

	headerArray = [];

	$.ajax({
		url: 'http://localhost:2050/columns',
		dataType: 'json',
		async: false,
		success: function (data) {

			for (let index = 0; index < data.length; index++) {
				headerArray[index] = data[index];
			}
		}
	});

	return headerArray;
}

class Utility {
	timeout: number = 0;

	debounce(func: Function, wait: number) {

		return (...args: any[]) => {
			const later = () => {
				clearTimeout(this.timeout);
				func(...args);
			};

			clearTimeout(this.timeout);
			this.timeout = setTimeout(later, wait);
		};
	};
}

const myTable = new Table();
const myUtility = new Utility();

window.onload = function () {

	const request = myUtility.debounce(myTable.buildTable, 250);

	request();

}

//on resize funtionalty to rebuild the table
$(window).on('resize', function () {
	// wrap the logic within a debounce funtion to prevent unnecesary calls.
	let request = myUtility.debounce(function () {

		myTable.from = myTable.from;

		myTable.buildTable();

	}, 250);

	request();
}
);

function buttonPropertySet() {
	let previous = <HTMLInputElement>document.getElementById("previous");
	let previous5 = <HTMLInputElement>document.getElementById("previous5");
	let previous10 = <HTMLInputElement>document.getElementById("previous10");
	let next = <HTMLInputElement>document.getElementById("next");
	let next5 = <HTMLInputElement>document.getElementById("next5");
	let next10 = <HTMLInputElement>document.getElementById("next10");

	let from = myTable.from;
	let totalRecords = myTable.totalRecords;

	// disable previous buttons when out of range
	if (from === 0) {
		previous.disabled = true;
		previous5.disabled = true;
		previous10.disabled = true;
	}
	else {
		previous.disabled = false;
		previous5.disabled = false;
		previous10.disabled = false;
	}

	// disable next buttons when out of range
	if (from + myTable.getNumberOfRows() === (totalRecords - 1)) {
		next.disabled = true;
		next5.disabled = true;
		next10.disabled = true;
	}
	else {
		next.disabled = false;
		next5.disabled = false;
		next10.disabled = false;
	}
}

//function to retrieve the total record count used when building the table
function getTotalRecords() {
	const HttpRequest = new XMLHttpRequest();
	const url = 'http://localhost:2050//recordCount';
	HttpRequest.open("GET", url, true);
	HttpRequest.send();

	const responseText = HttpRequest.responseText

	return parseInt(responseText);
}

// previous button function that takes a multiplier indicating the amount of pages to page at a time
function previousButton(multiplier: number) {
	// wrap the logic within a debounce funtion to prevent unnecesary calls.
	let request = myUtility.debounce(function () {

		myTable.from = myTable.from - ((myTable.getNumberOfRows() + 1) * multiplier);

		myTable.buildTable();

	}, 250);

	request();

}

//next button function that takes a multiplier indicating the amount of pages to page at a time
function nextButton(multiplier: number) {
	// wrap the logic within a debounce funtion to prevent unnecesary calls.
	let request = myUtility.debounce(function () {

		myTable.from = myTable.from + ((myTable.getNumberOfRows() + 1) * multiplier);

		myTable.buildTable();

	}, 250);

	request();

}

function jumpToButton() {
	let inputElement = <HTMLInputElement>document.getElementById("jumpToValue");
	let from: number;

	// wrap the logic within a debounce funtion to prevent unnecesary calls.
	let request = myUtility.debounce(function () {

		if (inputElement.value === "")
			from = 0;
		else
			from = parseInt(inputElement.value);

		myTable.from = from;

		myTable.buildTable();

	}, 250);

	request();

}

function test() {

}

