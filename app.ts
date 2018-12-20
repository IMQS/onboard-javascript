let firstIndex:number, lastIndex:number; // stores the indices of the first and last rows in the table
let recordCount:number; // stores the number of records in the database
let resizeTimer; // stores time since last window resize

// builds the grid table from the column headers and row data
function buildTable(columns, records) {

	// create table
	let table = document.createElement("table");
	table.className = "gridtable";
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
	let headRow = document.createElement("tr");

	// create column headers
    for(const header of columns) {
		var th = document.createElement("th");
		th.appendChild(document.createTextNode(header));
		headRow.appendChild(th);
    };
    thead.appendChild(headRow);
	table.appendChild(thead);

	// create rows
    records.forEach(function (el) {
		let tr = document.createElement("tr");
		for (var o in el) {
			let td = document.createElement("td");
			td.appendChild(document.createTextNode(el[o]))
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);

	// builds footer elements (buttons, search field)
	document.getElementById("footer").innerHTML = `<a onclick="goPrevious()">&laquo;</a>
	<a onclick="goNext()">&raquo;</a>
	<input type="text" id="search" onkeyup="search(event)" placeholder="Enter ID...">`;

	document.getElementById("loader").remove();

    return table;
}

// filters rows by user input ID
function search(e){
	let input = $("#search").val().toString();
	let $table = $("tbody tr").toArray();

	for(const record of $table){
		let td = record.getElementsByTagName("td")[0];
		record.style.display="block";
		if(td){
			let val = td.innerText || td.textContent;
			if(val.indexOf(input) > -1){
				record.style.display = "";
			}
			else{
				record.style.display = "none";
			} 		
		}
	}

	// if record doesn't exist on current page, query database and display results
	if(e.which == 13)
	{
		let end = parseInt(input) + calculateRows();
		clearTable();
		loadPage(parseInt(input), end);
	}
}

// load the previous page
function goPrevious(){
	let numRows = calculateRows();
	if(lastIndex > numRows){
		clearTable();
		loadPage(firstIndex-numRows, firstIndex-1);
	}
}

// load the next page
function goNext(){
	if(lastIndex < recordCount-1)
	{
		clearTable();
		loadPage(lastIndex+1, lastIndex+calculateRows());
	}
}

// clears the table and footer elements
function clearTable(){
	document.getElementById("content").innerHTML="";
	document.getElementById("footer").innerHTML="";
}

// loads the columns and rows to be displayed based on start and end row indices
function loadPage(start:number, end:number){
	firstIndex = start;
	lastIndex = end;

	// check bounds
	if(firstIndex<0) firstIndex = 0;
	if(lastIndex>=recordCount) lastIndex = recordCount-1;
	if(firstIndex>=recordCount){
		firstIndex = recordCount - calculateRows();
	} 

	// create loader
	let loader = document.createElement("loader");
	document.getElementById("content").appendChild(loader);
	loader.innerHTML=`<div class="loader" id="loader"></div>`;
	
	// outter function to fetch column headers from server
	$.get("http://localhost:2050/columns", function(columns){

		// inner function to fetch rows from server and invoke table build function
		$.get("http://localhost:2050/records?from="+firstIndex+"&to="+lastIndex, function(rows){
			document.getElementById("content").appendChild(buildTable(JSON.parse(columns), JSON.parse(rows)));
		});
	});
}

// determines the number of rows to display based on the window height
function calculateRows(){
	let x = (window.innerHeight - document.getElementById("footer").offsetHeight - document.getElementById("tableHeading").offsetHeight - 64)/36;
	return Math.floor(x)-1;
}

window.onload = function () {
	// hide browser scroll bar
	document.body.style.overflow = "hidden";

	// get record count
	$.get("http://localhost:2050/recordCount", function(data){

		// load the first page
		loadPage(0, calculateRows());
		recordCount = JSON.parse(data);
	});
	
}

// updates the table display when the window is resized
// debounce function to reduce frequency of queries made
window.onresize = () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function(){
		clearTable();
		loadPage(firstIndex, firstIndex + calculateRows());
	}, 250);
}