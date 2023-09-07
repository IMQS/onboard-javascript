// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch
// *** Development Setup ***//




// *** Global Variables ***//
const ROW_HEIGHT = 23;
let currentPage = 1;
let recordsPerPage = 25;
let totalRecords: number;
let lastFilteredId: string | null = null;
let cachedColumnNames: string[] | null = null;




// Initialize the page when the window loads
window.onload = async () => {
  calculateRecordsPerPage();
  await fetchTotalRecords();
  generateInitialTable();




  // Re-generate the table when the window is resized
  window.addEventListener("resize", debounce(async () => {
    calculateRecordsPerPage();
    if (lastFilteredId) {
      const id = parseInt(lastFilteredId, 10);
      filterRecordsById(id.toString());
    } else {
      const from = (currentPage - 1) * recordsPerPage;
      const to = from + recordsPerPage;
      generateTable(from, to, null);
    }
  }, 250));
  



  document.getElementById("prevBtn")?.addEventListener("click", () => {
    const filterInput = document.getElementById("filterInput") as HTMLInputElement;
    if (!filterInput.value) {
      lastFilteredId = null;
    }
  currentPage--;
  const from = (currentPage - 1) * recordsPerPage;
  const to = from + recordsPerPage;
  generateTable(from, to, lastFilteredId);

    if (currentPage === 1) {
      document.getElementById("prevBtn")?.setAttribute("disabled", "true");
    } else {
      document.getElementById("prevBtn")?.removeAttribute("disabled");
      document.getElementById("nextBtn")?.removeAttribute("disabled");
    }
  });
  



  document.getElementById("nextBtn")?.addEventListener("click", () => {
    const filterInput = document.getElementById("filterInput") as HTMLInputElement;
    if (!filterInput.value) {
      lastFilteredId = null;
    }
    currentPage++;
    const from = (currentPage - 1) * recordsPerPage;
    const to = from + recordsPerPage;
    generateTable(from, to, lastFilteredId);
    document.getElementById("prevBtn")?.removeAttribute("disabled");
  });
  



  // Filter functionality
  let errorTimeout: number | null = null;

const filterInput = document.getElementById("filterInput") as HTMLInputElement;
const errorMessage = document.getElementById("errorMessage");

if (filterInput && errorMessage) {
  filterInput.addEventListener("input", function() {
    const query = this.value.trim();
    
    // Clear any existing timeout and error message
    if (errorTimeout !== null) {
      clearTimeout(errorTimeout);
    }
    errorMessage.textContent = "";

    if (query === "") {
      // If input is empty, just return
      return;
    }

    const isValidNumber = /^[0-9]+$/.test(query) && parseInt(query, 10) <= 999999;

    if (isValidNumber) {
      filterRecordsById(query);
    } else {
      // Set up the delayed message
      errorTimeout = setTimeout(() => {
        errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999999.";
      }, 500);
    }
  });
  }
};




function generateInitialTable() {
  const from = 0;
  const to = recordsPerPage;
  generateTable(from, to, null);
}




  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
}




  // Calculate the number of records to display on each page based on the window height
  function calculateRecordsPerPage() {
    const headingHeight = document.getElementById('main-heading')?.offsetHeight || 0; 
    const paginationHeight = document.getElementById('pagination')?.offsetHeight || 0;  

    const availableHeight = window.innerHeight - headingHeight - paginationHeight - 15;

    recordsPerPage = Math.floor(availableHeight / ROW_HEIGHT);
  }




  // Fetch columns and cache them if they are not already cached
  async function fetchColumnData() {
    if (cachedColumnNames !== null) {
      return cachedColumnNames;
    }
    const response = await fetch("http://localhost:2050/columns");
    const columnNames = await response.json();
    cachedColumnNames = columnNames;  // Store in cache
    return columnNames;
  }
  
  


  // Generate the header of the table
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




  // Fetch a subset of row data from the server
  async function fetchRowData(from: number, to: number) {
    const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
    const records = await response.json();
    return records;
  }
  



  // Generate the body of the table
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




  // Generate the complete table
  async function generateTable(from: number, to: number, highlightId: string | null) {
    const columnNames = await fetchColumnData();
    const records = await fetchRowData(from, to);
    console.log(totalRecords);
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
    if (lastFilteredId) {
      centerHighlightedRow();
    }
    // Disable or Enable the Next button based on the last record
    if (to >= totalRecords - 1) {
      document.getElementById("nextBtn")?.setAttribute("disabled", "true");
    } else {
      document.getElementById("nextBtn")?.removeAttribute("disabled");
    }
  }
  



  // Fetch the total number of records
  async function fetchTotalRecords() {
    const response = await fetch("http://localhost:2050/recordCount");
    totalRecords = await response.json();
  }




  // Filter records by ID and regenerate the table accordingly
  async function filterRecordsById(query: string) {
    lastFilteredId = query;
    if (!query) {
      // Revert to initial state if no query
      generateTable(0, recordsPerPage, null);
      document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
      return;
    }
    let id = parseInt(query, 10);
    // Assuming your IDs start from 0 and are sequential
    let from = Math.max(0, id - Math.floor(recordsPerPage / 2));
    let to = from + recordsPerPage;
    // Update current page based on filtered ID
    currentPage = Math.ceil((id + 1) / recordsPerPage);
    // Enable or Disable the Previous button based on the current page
    if (currentPage > 1) {
      document.getElementById("prevBtn")?.removeAttribute("disabled");  // Enable the Previous button here
    } else {
      document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
    }
    to = Math.min(to, totalRecords - 1);
    if (to === totalRecords - 1) {
      from = to - recordsPerPage + 1;
    }
    console.log(`Fetching records from ${from} to ${to} with highlight on ${id}`);
    await generateTable(from, to, id.toString());
  }
  



  // Center the row that is highlighted
  function centerHighlightedRow() {
    const highlightedRow = document.querySelector(".highlighted");
    const mainContainer = document.getElementById("main-container"); 
  
    if (highlightedRow && mainContainer) {
      const containerHeight = mainContainer.clientHeight;
      const rowTop = highlightedRow.getBoundingClientRect().top;
      const rowHeight = highlightedRow.clientHeight;
      const scrollPosition = rowTop + mainContainer.scrollTop - (containerHeight / 2) + (rowHeight / 2);
      mainContainer.scrollTop = scrollPosition;
    }
  }
  
  
