// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch
let currentPage = 1;
const recordsPerPage = 10;
let totalRecords: number;

window.onload = async () => {
   $("footer").text("Hellooooooooooo ??"); 
   await fetchTotalRecords();

   //fetchColumns();
  const from = 0;
  const to = recordsPerPage;
  generateTable(from, to);

   document.getElementById("prevBtn")?.addEventListener("click", () => {
    currentPage--;
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
    generateTable(from, to);
    if (currentPage === 1) {
      document.getElementById("prevBtn")?.setAttribute("disabled", "true");
    } else {
      document.getElementById("prevBtn")?.removeAttribute("disabled");
      document.getElementById("nextBtn")?.removeAttribute("disabled");
    }
  });
  
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    currentPage++;
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
    generateTable(from, to);
    if (currentPage * recordsPerPage >= totalRecords) {
      document.getElementById("nextBtn")?.setAttribute("disabled", "true");
    } else {
      document.getElementById("nextBtn")?.removeAttribute("disabled");
      document.getElementById("prevBtn")?.removeAttribute("disabled");
  }
  });

  // Filter functionality
  const filterInput = document.getElementById("filterInput") as HTMLInputElement;
  if (filterInput) {
    filterInput.addEventListener("input", function() {
      const query = this.value;
      filterRecordsById(query);
    });
  }
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
  
  async function generateTable(from: number, to: number) {
    const columnNames = await fetchColumnData();
    const records = await fetchRowData(from, to);
    const thead = generateTableHeader(columnNames);
    const tbody = generateTableRows(records);
    
    // Clear existing data if any
    const table = document.getElementById('myTable');
    if (table) {
      table.innerHTML = "";
    }

    
    table?.appendChild(thead);
    table?.appendChild(tbody);
  }
  
  
  async function fetchTotalRecords() {
    const response = await fetch("http://localhost:2050/recordCount");
    totalRecords = await response.json();
  }
  
  async function filterRecordsById(query: string) {
    if (!query) {
      // Revert to initial state if no query
      generateTable(0, recordsPerPage);
      return;
    }
  
    // Parse the query to get the ID we're interested in
    const id = parseInt(query, 10);
  
    // Calculate which page the ID should be on
    currentPage = Math.floor((id - 1) / recordsPerPage) + 1;
  
    // Calculate the 'from' and 'to' parameters for that page
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
  
    // Generate the table for that page
    generateTable(from, to);
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
