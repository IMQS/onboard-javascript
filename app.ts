window.onload = () => { $("footer").text("Hello Riaan Theron!!"); 

$.ajax({
    url: '/columns',
    method: 'GET',
    success: function(data) {
      const columnNames = JSON.parse(data);
      const tableHeader = $('<thead></thead>');
      //console.log('Success:', data);

      columnNames.forEach(function(columnName: string) {
        const th = $('<th></th>').text(columnName);
        tableHeader.append(th);
      });

      // Append the table header to your table using the correct selector
      $('#myTable thead').replaceWith(tableHeader);
    },
    error: function(xhr, status, error) {
      console.error('Error fetching column names:', error);
    }
  });

  // Fetch and display data, and implement navigation controls in the following steps...
};


