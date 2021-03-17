
const myTable = new Table();


window.onload = function () {
	addButtons();
	myTable.initialTableBuild();
}

$(window).on('resize', function () {

	myTable.buildTable();
}
);

function buttonPropertySet() {
	let previous = <HTMLInputElement>document.getElementById("previous");
	let previous5 = <HTMLInputElement>document.getElementById("previous5");
	let previous10 = <HTMLInputElement>document.getElementById("previous10");
	let next = <HTMLInputElement>document.getElementById("next");
	let next5 = <HTMLInputElement>document.getElementById("next5");
	let next10 = <HTMLInputElement>document.getElementById("next10");
	let jumpToButton = <HTMLInputElement>document.getElementById("jumpToButton");

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

	jumpToButton.disabled = false;
}

// previous button function that takes a multiplier indicating the amount of pages to page at a time
function previousButton(multiplier: number) {
	myTable.from = myTable.from - ((myTable.getNumberOfRows() + 1) * multiplier);

	myTable.buildTable();
}

// next button function that takes a multiplier indicating the amount of pages to page at a time
function nextButton(multiplier: number) {
	myTable.from = myTable.from + ((myTable.getNumberOfRows() + 1) * multiplier);

	myTable.buildTable();
}

function jumpToButton() {
	let inputElement = <HTMLInputElement>document.getElementById("jumpToValue");
	let from: number;

	if (inputElement.value === "")
		from = 0;
	else
		from = parseInt(inputElement.value);

	myTable.from = from;

	myTable.buildTable();

}

function addButtons() {

	let button: HTMLButtonElement;
	let buttonDiv = <HTMLElement>document.getElementById("buttondiv");

	button = document.createElement("button");
	button.innerHTML = "&lt&lt&lt 10";
	button.id = "previous10";
	button.setAttribute("disabled", "true");
	button.onclick = () => { previousButton(10) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "&lt&lt 5";
	button.id = "previous5";
	button.setAttribute("disabled", "true");
	button.onclick = () => { previousButton(5) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "&lt";
	button.id = "previous";
	button.setAttribute("disabled", "true");
	button.onclick = () => { previousButton(1) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "&gt";
	button.id = "next";
	button.setAttribute("disabled", "true");
	button.onclick = () => { nextButton(1) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "5 &gt&gt ";
	button.id = "next5";
	button.setAttribute("disabled", "true");
	button.onclick = () => { nextButton(5) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "10 &gt&gt&gt";
	button.id = "next10";
	button.setAttribute("disabled", "true");
	button.onclick = () => { nextButton(10) };
	buttonDiv.appendChild(button);

	button = document.createElement("button");
	button.innerHTML = "Jump To:";
	button.id = "jumpToButton";
	button.setAttribute("disabled", "true");
	button.onclick = () => { jumpToButton() };
	buttonDiv.appendChild(button);

	let input = document.createElement("INPUT");
	input.id = "jumpToValue";
	input.setAttribute("type", "number");
	buttonDiv.appendChild(input);

}
