/// <reference path="third_party/jquery.d.ts" />
let $tbody;
$(document).ready(function () {
    //Web services Project to get services from main.go.
	//you must run this command "go run main.go" from the command line to start the services. then start this program
    getColumns();  
    getAllRecordsPaginated();
    getRecordsCount();
	getPagination();
	
});

function getColumns() {  	   
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/columns",
		success: function (data1) {		
			let table = '<table id="tableheader" border="1px" cellspacing="5px" style="width:100%;"><thead class="thead" width="150px">';
			$.each(data1, function (key, value) {
				table += '<th width="150px">' + value + '</th>';				
			});
			table += '</thead>';
		$('#tableheader').append(table);   			            
		},
		error: function (msg) {
			alert(" Error occured  \n" + JSON.stringify(msg));
		}
   });    
}
function getAllRecordsPaginated() {
	$.ajax({
		url: '/records?from=0&to=10000',
		type:'GET',
		dataType: 'json',
		contentType: 'application/json', 
        success: function (data) {			
            let table = '<table id="tBody" cellspacing="5px" border="1px">';
            $.each(data, function (key, valueData) {
                table += '<tr>';
                $.each(valueData, function (key, value) {
                    table += '<td width="165px" >' + value + '</td>';
                });
                table += '</tr>';
            });
            table += '</table>';
            $('#tBody').append(table);            
		},
		error: function (msg) {
			alert(" Error occured  \n" + JSON.stringify(msg));
		}
	})
}

function getRecordsCount() {
	$.ajax({
		url: '/recordCount',
		type: 'GET',
		dataType: 'json',
		success: function (data2) {
            $('#div2').append('Total Records : '+ data2);
		},
		error: function (msg) {
			alert(" Error occured  \n" + JSON.stringify(msg));
		}
	})

}
function getPagination() {
	//highlighting the column selected
	$('.tbody').on('clicked.rs.row', function (evt) {
		let rows = $(this).select;
	});
	// Pagination started 
	let pageSize = 25;
	let x = 1;
	let x10 = x.toString().trim();
	$("#hdnActivePage").val(x10);
	let numberOfPages = $('tbody tr').length / pageSize;

	//what should happen when Next Button is clicked
	$("a.next").on('click', function () {
		$("tbody tr:nth-child(-n+" + (($("#hdnActivePage").val() * pageSize) + pageSize) + ")").show();
		$("tbody tr:nth-child(-n+" + $("#hdnActivePage").val() * pageSize + ")").hide();
		let currentPage = Number($("#hdnActivePage").val());
		let newpage: number;
		newpage = currentPage;
		let x4: number;
		x4 = newpage + 1;
		let x8 = x4.toString().trim();
		$("#hdnActivePage").val(x8);
		if ($("#hdnActivePage").val() != 1) {
			$("a.previous").show();
			$("span").show();
		}
		if ($("#hdnActivePage").val() === numberOfPages) {
			$("a.next").hide();
			$("span").hide();
		}
	});
	//what should happen when Previous Button is clicked
	$("a.previous").on('click', function () {
		let currentPage = Number($("#hdnActivePage").val() - 1);
		let presult = "" + currentPage.toString().trim();
		$("#hdnActivePage").val(presult);
		$("tbody tr").hide();
		$("tbody tr:nth-child(-n+" + ($("#hdnActivePage").val() * pageSize) + ")").show();
		$("tbody tr:nth-child(-n+" + (($("#hdnActivePage").val() * pageSize) - pageSize) + ")").hide();

		if ($("#hdnActivePage").val() === 1) {
			$("a.previous").hide();
			$("span").hide();
		}
		if ($("#hdnActivePage").val() < numberOfPages) {
			$("a.next").hide();
			$("span").show();
		}
		if ($("#hdnActivePage").val() === 1) {
			$("span").hide();
		}
	});
}

