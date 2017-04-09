/// <reference path="jquery.d.ts" />

/**
 * Michael Leibbrandt 
 * Typescript Onboard Project
 */
namespace onboard {

	let totRec: number;
	let totHeadings: number;
	let fromRecord: number = 0;
	let increase: number;
	let resizeCounter;

	// Makes an onresize trigger event
	window.onresize = winResize;

	winResize();
	// Binds button actions once window is ready
	$(() => {
		$('#nxtButton').click(() => next());
		$('#prvButton').click(() => previous());
		let headers = "<tr id ='headings'>";
		$.getJSON("/columns", (data) => {
			// Retrieves and sets column names
			totHeadings = data.length;

			for (let i = 0; i < totHeadings; i++) {
				headers += `<th>${data[i]}</th>`
			}
			headers += "</tr>";
			$("#grid").append(headers);
		});
		//nxtButton$('#nxtButton').on('click', next);
	});

	// Cleans up and retrieves previous table of data
	function previous() {
		$('#nxtButton').prop("disabled", false);
		fromRecord -= increase;
		winResize();
	}

	// Cleans up and retrieves next table of data		
	function next() {
		$('#prvButton').prop("disabled", false);
		fromRecord += increase;
		winResize();
	}

	function populate(from) {
		// Flag to see if API call is looking for invalid request
		if (fromRecord < 0) { from = 0; }

		// Retrieves columns or Headings from API GET call
		if (from === 0) {
			$('#prvButton').prop("disabled", true);
		} else if (from === totRec) {
			$('#nxtButton').prop("disabled", true);
		}

		let records = "<tr>";
		$.getJSON("/records?from=" + from + "&to=" + (from + increase), function (data) {
			$('#grid tr').not('#headings').remove();
			// Loops throughout the data and inserts the records into the table
			for (let i = 0; i < data.length; i++) {
				for (let j = 0; j < totHeadings; j++) {
					records += `<td>${data[i][j]}</td>`
				}
				records += "<tr/>";
			}
			$("#grid").append(records);
		});
	}
	// Onresize has debounce methodology along with a reset timer 150ms in this case
	function winResize() {
		clearTimeout(resizeCounter);
		resizeCounter = setTimeout(() => {
			let usableHeight = $("body").height() - $("#nav").height();
			$("#grid").height(usableHeight - 25);
			increase = Math.floor(usableHeight / 31);
			populate(fromRecord);
		}, 150);
	}
	$.getJSON("/recordCount", (data) => {
		totRec = data;
	});
}