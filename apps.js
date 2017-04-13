var $tbody;
$(document).ready(function () {
    //Simulate Ajax call here to get customer data
    getCustomerData();
    getAllRecords();
    getRecordsCount();
});
function getCustomerData() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/columns",
        success: function (data1) {
            var table = '<table id="tableheader" border="1px" cellspacing="5px" style="width:100%;"><thead class="thead" width="150px">';
            $.each(data1, function (key, value) {
                table += '<th width="150px">' + value + '</th>';
            });
            table += '</thead>';
            $('#tableheader').append(table);
        }
    });
}
function getAllRecords() {
    $.ajax({
        url: '/records?from=0&to=10000',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            var table = '<table id="tBody" cellspacing="5px" border="1px">';
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
    });
}
function getRecordsCount() {
    $.ajax({
        url: '/recordCount',
        type: 'GET',
        dataType: 'json',
        /*data: {
            format: 'json'
        },*/
        success: function (data2) {
            //console.log(data2)
            $('#div2').append('Total Records : ' + data2);
        },
        error: function (msg) {
            alert(" Error occured  \n" + JSON.stringify(msg));
        }
    });
}
function getPagination() {
}
//# sourceMappingURL=apps.js.map