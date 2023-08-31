// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch

window.onload = () => {
   $("footer").text("Hello Who is watching ??"); 
   //fetchTotalRecords();
   //fetchColumns();
   generateTable();
  

  };

  async function fetchColumnData() {
    const response = await fetch("http://localhost:2050/columns");
    const columnNames = await response.json();
    return columnNames;
  }
  

  function generateTableHeader(columnNames: string[]) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    columnNames.forEach((name) => {
      const th = document.createElement('th');
      th.textContent = name;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    return thead;
  }
  
  async function fetchRowData(from: number, to: number) {
    const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
    const records = await response.json();
    return records;
  }
  
  function generateTableRows(records: any[][]) {
    const tbody = document.createElement('tbody');
    records.forEach((record) => {
      const tr = document.createElement('tr');
      record.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    return tbody;
  }
  
  async function generateTable() {
    const columnNames = await fetchColumnData();
    const records = await fetchRowData(0, 10); // Replace with your fromID and toID
    const thead = generateTableHeader(columnNames);
    const tbody = generateTableRows(records);
  
    const table = document.getElementById('myTable');
    table?.appendChild(thead);
    table?.appendChild(tbody);
  }
  




















// async function fetchTotalRecords() {
//   // Fetch data from API
//   const response = await fetch("http://localhost:2050/recordCount");

//   // Check for successful response
//   if (response.ok) {
//     // Parse the text content from the response body
//     const data = await response.text();

//     // Log the data to the console
//     console.log(`Total records: ${data}`);
//   } else {
//     // Log an error message if the request was not successful
//     console.log(`Fetch failed: ${response.status} ${response.statusText}`);
//   }
// };

// async function fetchColumns() {
//   // Fetch data from API
//   const response = await fetch("http://localhost:2050/columns");

//   // Check for successful response
//   if (response.ok) {
//     // Parse the text content from the response body
//     const data = await response.json();

//     // Log the data to the console
//     console.log(`Columns: ${data}`);
//   } else {
//     // Log an error message if the request was not successful
//     console.log(`Fetch failed: ${response.status} ${response.statusText}`);
//   }
// }
