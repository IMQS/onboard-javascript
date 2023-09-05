// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch
// *** Development Setup ***//


// *** Global Variables ***//
const ROW_HEIGHT = 30;
let currentPage = 1;
let recordsPerPage = 25;
let totalRecords: number;
let lastFilteredId: string | null = null;




window.onload = async () => {

   calculateRecordsPerPage();

   await fetchTotalRecords();

  // Re-generate the table when the window is resized
  window.addEventListener("resize", async () => {
    calculateRecordsPerPage();
    if (lastFilteredId) {
      const id = parseInt(lastFilteredId, 10);
      filterRecordsById(id.toString());
    } else {
      const from = (currentPage - 1) * recordsPerPage;
      const to = from + recordsPerPage;
      generateTable(from, to, null);
    }
  });
  

   //fetchColumns();
  const from = 0;
  const to = recordsPerPage;
  generateTable(from, to, null);
  centerHighlightedRow(); // add this line
;

   document.getElementById("prevBtn")?.addEventListener("click", () => {
    lastFilteredId = null;
    currentPage--;
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
    generateTable(from, to, null);
;
    if (currentPage === 1) {
      document.getElementById("prevBtn")?.setAttribute("disabled", "true");
    } else {
      document.getElementById("prevBtn")?.removeAttribute("disabled");
      document.getElementById("nextBtn")?.removeAttribute("disabled");
    }
  });
  
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    lastFilteredId = null;
    currentPage++;
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
    generateTable(from, to, null);
;
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

  // *** Function ***//
  function calculateRecordsPerPage() {
    recordsPerPage = Math.floor(window.innerHeight / ROW_HEIGHT);
  }

  // *** Function ***//
  async function fetchColumnData() {
    const response = await fetch("http://localhost:2050/columns");
    const columnNames = await response.json();
    return columnNames;
  }
  
  // *** Function ***//
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

  // *** Function ***//
  async function fetchRowData(from: number, to: number) {
    const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
    const records = await response.json();
    return records;
  }
  
  // *** Function ***//
  function generateTableRows(records: any[][], highlightId: string | null) {
    const tbody = document.createElement('tbody');
    records.forEach((record, index) => {
      const tr = document.createElement('tr');
      tr.id = `row-${record[0]}`;  // Assuming the ID is the first cell in each record
      
      // Highlight the row if it matches the filtered ID
      if (highlightId && highlightId === record[0].toString()) {
        tr.classList.add("highlighted-green");
      }
      record.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    return tbody;
  }

  // *** Function ***//
  async function generateTable(from: number, to: number, highlightId: string | null) {
    const columnNames = await fetchColumnData();
    const records = await fetchRowData(from, to);

    if (to > totalRecords) {
      to = totalRecords;
    }
    const thead = generateTableHeader(columnNames);
    const tbody = generateTableRows(records, highlightId);  // Passing highlightId here
    
    // Clear existing data if any
    const table = document.getElementById('myTable');
    if (table) {
      table.innerHTML = "";
    }
    table?.appendChild(thead);
    table?.appendChild(tbody);
    centerHighlightedRow();
  }
  
  // *** Function ***//
  async function fetchTotalRecords() {
    const response = await fetch("http://localhost:2050/recordCount");
    totalRecords = await response.json();
  }

  // *** Function ***//
  async function filterRecordsById(query: string) {
    lastFilteredId = query;
    if (!query) {
      // Revert to initial state if no query
      generateTable(0, recordsPerPage, null);
      return;
    }
    let id = parseInt(query, 10);

    // Assuming your IDs start from 0 and are sequential
    let from = Math.max(0, id - Math.floor(recordsPerPage / 2));
    let to = from + recordsPerPage;

    to = Math.min(to, totalRecords - 1);

    if (to === totalRecords - 1) {
      from = to - recordsPerPage + 1;
    }
    console.log(`Fetching records from ${from} to ${to} with highlight on ${id}`);

    await generateTable(from, to, id.toString());
    centerHighlightedRow();
  }

  // *** Function ***//
  function centerHighlightedRow() {
    const highlightedRow = document.querySelector(".highlighted");
    const mainContainer = document.getElementById("main-container"); // Add this line
  
    if (highlightedRow && mainContainer) {
      const containerHeight = mainContainer.clientHeight;
      const rowTop = highlightedRow.getBoundingClientRect().top;
      const rowHeight = highlightedRow.clientHeight;
      const scrollPosition = rowTop + mainContainer.scrollTop - (containerHeight / 2) + (rowHeight / 2);
      mainContainer.scrollTop = scrollPosition;
    }
  }
  
  
