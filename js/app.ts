/// <reference path="../defs/jquery.d.ts" />

$(document).ready(function() {
	getTableColumns();
});

/*
* This function gets the table column headings
*/
function getTableColumns() {
	$.ajax({
		type: "GET",
		url: "/columns",
		dataType: "json",
		success: function(data) {
			let table = '<table class="table"><thead class="theader"><tr>';
			$.each(data, function(i, item) {
				table += "<th>" + item + "</th>";
			});
			table += '</tr></thead>';
			let onfinish = function (arg) {
				displayRecords(0, arg - 700000, table);
			}
			getRecordCount(onfinish);
		},
	});
}

/*
* This function displays a set number of records
*/
function displayRecords(from, to, table) {
	$.ajax({
		type: "GET",
		url: "/records?from=" + from + "&to=" + to,
		dataType: "json",

		success: function(data) {
			table += "<tbody>";
			$.each(data, function (i, item) {
				table += '<tr>'
				for (let ix in item) {
					table += '<td>' + item[ix] + '</td>';
				}
				table += '</tr>';
			});
			table += '</tbody></table>';
			$("#tableGrid").append(table);
		},
	});

	// This is where the pagination is done
	let currentTable = $('#tableGrid');
	currentTable.each(function() {
		let currentPage = 0;
		let numbersPerPage = 5000;
		let table = currentTable;
		let tableBody = $('tbody tr');
		table.bind('pagination', function() {
			table.find('tbody tr').hide().slice(currentPage * numbersPerPage, (currentPage + 1) * numbersPerPage).show();
		});
		table.trigger('pagination');
		let numberOfRows = table.find('tbody tr').length;
		let numberOfPages = 20;
		let pager = $('<div class="pager"></div>');
		for (let page = 0; page < numberOfPages; page++) {
			$('<span class="page-number"></span>').text(page + 1).bind('click', { nextPage: page }, function(event) {
				currentPage = event.data['nextPage'];
				table.trigger('pagination');
				$(this).addClass('active').siblings().removeClass('active');
			}).appendTo(pager).addClass('clickable');
		}
		pager.insertBefore(table).find('span.page-number:first').addClass('active');
	});
}

/*
* This function gets the total number of records
*/
function getRecordCount(onfinish) {
	$.ajax({
		type: "GET",
		url: "/recordCount",
		dataType: "json",
		success: function (data) {
			onfinish(data);
		},
	});
}





