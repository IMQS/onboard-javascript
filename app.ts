// ****************************************************** Data ********************************************************* /

// ApiManager Class 
class ApiManager {
  totalRecordCount: number;
  columnNames: string[] | null;
  // from: number = 0; 
  // to: number = 0;


  constructor() {
    this.totalRecordCount = 0;
    this.columnNames = null;
  }

  async fetchTotalRecordCount(): Promise<void> {
    console.log("Function #3 - Executing fetchTotalRecordCount");
    try {
      const response = await fetch('http://localhost:2050/recordCount');
      if (!response.ok) {
        throw new Error(`Failed to fetch total record count: ${response.statusText}`);
      }
      const data: number = await response.json();
      this.totalRecordCount = data;
      //this.to = data;
    } catch (error) {
      console.error(`Error fetching total record count: ${error}`);
    }
  }
  
  async fetchColumnNames(): Promise<void> {
    console.log("Function #5 - Executing fetchColumnNames");
    try {
      const response = await fetch('http://localhost:2050/columns');
      if (!response.ok) {
        throw new Error(`Failed to fetch column names: ${response.statusText}`);
      }
      const data: string[] = await response.json();
      this.columnNames = data;
    } catch (error) {
      console.error(`Error fetching column names: ${error}`);
    }
  }
  
  async fetchRecords(from: number, to: number): Promise<any[][] | null> {
    console.log(`Function #12.1 - Executing fetchRecords with from: ${from}, to: ${to}`);
    try {
      const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }
      const data: any[][] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching records: ${error}`);
      return null;
    }
  }
  
}

// ****************************************************** Model ********************************************************* /

class StateManager {
  private rowHeight: number;
  private headerHeight: number;
  private availableHeight: number;
  private numRows: number;
  private from: number;
  private to: number;
  private apiManager: ApiManager;
  private records: any[][] | null = null;
  private columnNames: string[] | null;
  private totalRecordCount = 0;
  highlightedId: number | null = null;

  constructor(apiManager: ApiManager) {
    this.rowHeight = 20; // Default value, can be updated later
    this.headerHeight = 180; // Default value, can be updated later
    this.availableHeight = 0;
    this.numRows = 0;
    this.apiManager = apiManager;
    this.from = 0; // Default values, will be overwritten in initialize()
    this.to = 0; // Default values, will be overwritten in initialize()
    this.columnNames = null;
    this.totalRecordCount = 0;
  }
  async initializeState(): Promise<void> {
    console.log("Function #1 - Executing initialize");
    await this.fetchAndStoreTotalRecordCount();
    await this.retrieveColumnNames();
    this.adjustWindowSize();
  }

  async retrieveColumnNames() {
    console.log("Function #4 - Executing retrieveColumnNames");
    await this.apiManager.fetchColumnNames();
    if (this.apiManager.columnNames !== null) {
      this.columnNames = this.apiManager.columnNames;
    }
  }
  
  async fetchAndStoreTotalRecordCount(): Promise<void> {
    console.log("Function #2 - Executing fetchAndStoreTotalRecordCount");
    await this.apiManager.fetchTotalRecordCount();
    this.totalRecordCount = this.apiManager.totalRecordCount;
  }
  
  getTotalRecordCount(): number {
    return this.totalRecordCount;
  }
  
  getColumnNames(): string[] | null {
    console.log("Function #10 - Executing getColumnNames");
    return this.columnNames;
  }
  
  
  getRecords(): any[][] | null {
    console.log("Function #13 - Executing getRecords");
    return this.records;
  }
  

  getFrom(): number {
    console.log("Function #18 - Executing getFrom");
    return this.from;
  }

  setFrom(value: number): void {
    console.log("Function #7 - Executing setFrom");
    this.from = value;
  }

  getTo(): number {
    console.log("Function #19 - Executing getTo");
    return this.to;
  }

  setTo(value: number): void {
    console.log("Function #8 - Executing setTo");
    this.to = value;
  }

  goToNextPage(): void {
    console.log("Function #17 - Executing goToNextPage");
    const from = this.getFrom();
    const to = this.getTo();
    const stepSize = to - from + 1;
  
    // Calculate the new 'from' and 'to' values
    const newFrom = from + stepSize;
    const newTo = to + stepSize;
  
    // Check that 'to' does not exceed totalRecordCount
    if (newTo >= this.totalRecordCount) {
      this.setTo(this.totalRecordCount - 1);
      this.setFrom(newFrom); 
    } else {
      this.setFrom(newFrom);
      this.setTo(newTo);
    }
  }
  

  goToPreviousPage(): void {
    console.log("Function #22 - Executing goToPreviousPage");
    const from = this.getFrom();
    const to = this.getTo();
    const recordsPerPage = this.numRows;
  
    // Calculate the new 'from' and 'to' values
    const newFrom = from - recordsPerPage;
    const newTo = newFrom + recordsPerPage - 1;
  
  
    if (newFrom < 0) {
      // Set the 'from' value to zero
      this.setFrom(0);
      this.setTo(recordsPerPage - 1);

    } else {
      this.setFrom(newFrom);
      this.setTo(newTo);
    }
  }
  
  async searchByIdStateChange(id: number): Promise<void> {
    console.log("Function #24 - Executing searchByIdStateChange");
  
    const newFrom = id;
    const newTo = id + this.numRows - 1;
  
    // Check that 'to' does not exceed totalRecordCount
    if (newTo >= this.totalRecordCount) {
      this.setTo(this.totalRecordCount - 1);
    } else {
      this.setTo(newTo);
    }
  
    this.setFrom(newFrom);
  
    await this.retrieveRecords();
  }
  

  // Inside StateManager class
  adjustWindowSize(): void {
    console.log("Function #6 - Executing adjustWindowSize");
    this.availableHeight = window.innerHeight - this.headerHeight;
    this.numRows = Math.floor(this.availableHeight / this.rowHeight);
    if (this.numRows <= 0) {
      console.log("Window size too small, setting minimum number of rows to 1");
      this.numRows = 1;
    }
    // Check if on the first page
    if (this.from === 0) {
      this.setFrom(0);  // Assuming the first row is always 0
      this.setTo(this.numRows - 1);

    } else {
      // If not on the first page, only adjust the 'to' value
      this.setTo(this.from + this.numRows - 1);
    }
  }

  async retrieveRecords() {
    console.log("Function #12 - Executing retrieveRecords");
    this.records = await this.apiManager.fetchRecords(this.from, this.to);
  }
}

// ****************************************************** View ********************************************************* /


// TableRenderer Class
type apiRecord = any[];

class TableRenderer {
  private stateManager: StateManager;

  // Constructor
  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async initialRender(stateManager: StateManager): Promise<void> {
    console.log("Function #9 - Executing initialRender");
    const columnNames = stateManager.getColumnNames();
    if (columnNames !== null) {
      this.renderColumnNames(columnNames);
    }

    await stateManager.retrieveRecords();
    const records = stateManager.getRecords();

    // Render the records if they're available
    if (records !== null) {
      this.renderRecords(records);
    }
  }

  renderColumnNames(columnNames: string[]): void {
    console.log("Function #11 - Executing renderColumnNames");
    try {
      const thead = document.querySelector('thead');
      if (thead === null) {
        throw new Error('Table header not found.');
      }
      
      const row = document.createElement('tr');
      for (const columnName of columnNames) {
        const cell = document.createElement('th');
        cell.textContent = columnName;
        row.appendChild(cell);
      }
      thead.appendChild(row);

      // Set column widths using the provided function
      this.setColumnWidths();
    } catch (error) {
      if (error instanceof Error) {  // Type guard
        console.error(`An error occurred: ${error.message}`);
      } else {
        console.error(`An unknown error occurred: ${error}`);
      }
    }
  }
  setColumnWidths(): void {
    console.log("Function #11.1 - Executing setColumnWidths");
    // Assuming your table has an id of "myTable"
    const table = document.getElementById("myTable");
    
    if (table) {
      // Count the number of columns in your table
      const headerCells = table.querySelectorAll("th");
      const numCols = headerCells.length;
  
      // Calculate the width for each column
      const colWidth = 100 / numCols;
  
      // Set the width
      headerCells.forEach((headerCell: Element) => {
        (headerCell as HTMLElement).style.width = `${colWidth}%`;
      });
    }
  }

  renderRecords(records: apiRecord[] | null, highlightId: number | null = null) {
    console.log("Function #14 - Executing renderRecords");
    highlightId = highlightId ?? this.stateManager.highlightedId; // use state if highlightId is null
    try {
      if (records === null) {
        throw new Error("No records to render.");
      }

      const tbody = document.querySelector('tbody');
      if (tbody === null) {
        throw new Error('Table body not found.');
      }
      
      tbody.innerHTML = ''; // Clear existing rows
      
      records.forEach((record) => {
        const row = document.createElement('tr');
        if (highlightId !== null && record.length > 0 && parseInt(record[0].toString(), 10) === highlightId) {
          row.classList.add('highlight');
        }
        record.forEach((cell) => {
          const td = document.createElement('td');
          td.textContent = cell.toString();
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }
  
  
  async adjustRows(): Promise<void> {
    console.log("Function #7 - Executing adjustRows");
    try {
      // const rowHeight = 20;
      // const headerHeight = 180;
      // const availableHeight = window.innerHeight - headerHeight;
    
      // let numRows = Math.floor(availableHeight / rowHeight);
  
      // Use StateManager to get and set 'from' and 'to'
      // this.stateManager.setFrom(0);
      // this.stateManager.setTo(numRows - 1);
  
      // Check for a minimum number of rows
      // if (numRows <= 0) {
      //   console.log("Window size too small, setting minimum number of rows to 1");
      //   numRows = 1;
      // }
  
      // Fetch the records using StateManager
      
  
      // Get the records from StateManager
      const records = this.stateManager.getRecords();
  
      // Render the records if they're available
      if (records !== null) {
        this.renderRecords(records);
      }
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }
}

// ****************************************************** Controller ********************************************************* /

// WindowResizeHandler Class
class WindowResizeHandler {
  private timeoutId: number | null = null;

  constructor(
    private tableRenderer: TableRenderer,
    // private paginationManager: PaginationManager,
    private stateManager: StateManager
    ) {}

  // Inside WindowResizeHandler class
  handleResize() {
    console.log("Function #15 - Executing handleResize");

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(async () => {
      // Delegate the logic to adjust 'from' and 'to' to StateManager
      
      this.stateManager.adjustWindowSize();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();
  
    // Render the records if they're available
    if (records !== null) {
      this.tableRenderer.renderRecords(records);
    }
      this.timeoutId = null;
    }, 250);
  }

}

// PaginationManager Class
class PaginationManager {
  // currentPage: number = 1;

  constructor(private tableRenderer: TableRenderer, private stateManager: StateManager) {
    this.tableRenderer = tableRenderer;
    this.stateManager = stateManager
    //this.updateButtonStates();
  }

  async navigateToHome() {
    console.log("Function #25 - Navigating to Home");
    window.location.reload();
  }

  async incrementPage(): Promise<void> {
    console.log("Function #16 - Executing incrementPage");
    this.stateManager.goToNextPage();
    await this.stateManager.retrieveRecords();
    const records = this.stateManager.getRecords();
    
    if (records !== null) {
      this.tableRenderer.renderRecords(records);
    }
    this.updateButtonStates();
  }

  async decrementPage(): Promise<void> {
    console.log("Function #21 - Executing decrementPage");
    this.stateManager.goToPreviousPage();
    await this.stateManager.retrieveRecords();
    const records = this.stateManager.getRecords();
    
    if (records !== null) {
      this.tableRenderer.renderRecords(records);
    }
    this.updateButtonStates();
  }

  async searchById(): Promise<void> {
    console.log("Function #23 - Executing searchById");
    const filterInput = document.getElementById('filterInput') as HTMLInputElement;
    const searchValue = parseInt(filterInput.value, 10);
    this.stateManager.highlightedId = searchValue;
    await this.stateManager.searchByIdStateChange(searchValue);
    const records = this.stateManager.getRecords();
    
    if (records !== null) {
      this.tableRenderer.renderRecords(records, searchValue);
    }
    
    this.updateButtonStates();
  }

  setupLiveValidation(): void {
  const filterInput = document.getElementById('filterInput') as HTMLInputElement;
  const errorMessage = document.getElementById('errorMessage') as HTMLElement;

  filterInput.addEventListener('input', () => {
    const inputValue = filterInput.value;

    if (inputValue.length === 0) {
      errorMessage.textContent = "";
    } else if (inputValue.length < 1 || inputValue.length > 6 || !/^\d+$/.test(inputValue)) {
      errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999 999.";
    } else {
      errorMessage.textContent = "";
    }
   });
  }


  private updateButtonStates(): void {
    console.log("Function #20 - Executing updateButtonstates");
    const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
    const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  
    const from = this.stateManager.getFrom(); // Use the getter to get the value of `from`
    const to = this.stateManager.getTo(); // Use the getter to get the value of `to`
    const totalRecordCount = this.stateManager.getTotalRecordCount(); // Use a getter to get the totalRecordCount
  
    if (prevButton !== null) {
      prevButton.disabled = from === 0;
    }
  
    if (nextButton !== null) {
      nextButton.disabled = to === totalRecordCount - 1;
    }
  }
}

// ****************************************************** Main Script ********************************************************* /
// main script
window.onload = async () => {
  console.log("Event #1 - Executing window.onload");

  // Initialize Data
  const apiManager = new ApiManager(); 
  

  // Initialize Model
  const stateManager = new StateManager(apiManager); 
  await stateManager.initializeState();  // Don't forget to await!
  

  // Initialize View
  const tableRenderer = new TableRenderer(stateManager); 
  await tableRenderer.initialRender(stateManager);


  // Initialize Controllers
  const windowResizeHandler = new WindowResizeHandler(tableRenderer, stateManager); 
  const paginationManager = new PaginationManager(tableRenderer, stateManager);
  
    // Attach event listeners
    paginationManager.setupLiveValidation();
    window.addEventListener('resize', () => windowResizeHandler.handleResize());
    document.getElementById("prevPage")?.addEventListener("click", () => { paginationManager.decrementPage();})
    document.getElementById("nextPage")?.addEventListener("click", () => { paginationManager.incrementPage();})
    document.getElementById('searchButton')?.addEventListener("click", () => { paginationManager.searchById();})
    document.getElementById("main-heading")?.addEventListener("click", () => { paginationManager.navigateToHome();})
};



























// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch
// *** Development Setup ***//




// *** Global Variables ***//
// const ROW_HEIGHT = 21;
// let currentPage = 1;
// let recordsPerPage = 25;
// let totalRecords: number;
// let lastFilteredId: string | null = null;
// let cachedColumnNames: string[] | null = null;
// let totalPages: number;





// // Initialize the page when the window loads
// window.onload = async () => {
//   calculateRecordsPerPage();
//   await fetchTotalRecords();
//   generateInitialTable();




//   // Re-generate the table when the window is resized
//   // Re-generate the table when the window is resized
//   window.addEventListener("resize", debounce(async () => {
//     // Find the first row and its ID.
//     const firstRow = document.querySelector('#myTable tbody tr');
//     let firstRowId = 0;
    
//     if (firstRow && firstRow.id) {
//       firstRowId = parseInt(firstRow.id.split('-')[1], 10);
//     }
    
//     console.log("In debounce (before recalculating):");
//     console.log(`First row ID: ${firstRowId}`);
//     console.log(`Current page: ${currentPage}`);
    
//     // Recalculate the number of records per page
//     calculateRecordsPerPage();
  
//     // Recalculate currentPage based on firstRowId
//     currentPage = Math.floor(firstRowId / recordsPerPage) + 1;
    
//     console.log("In debounce (after recalculating):");
//     console.log(`First row ID should still be: ${firstRowId}`);
//     console.log(`New current page: ${currentPage}`);
    
//     // Regenerate table
//     if (lastFilteredId) {
//       const id = parseInt(lastFilteredId, 10);
//       filterRecordsById(id.toString());
//     } else {
//       generateTable(currentPage, null);  // Generate the table for the current page
//     }
//   }, 250));
  
  

// // Handle Previous button click
// document.getElementById("prevBtn")?.addEventListener("click", () => {
//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   if (!filterInput.value) {
//     lastFilteredId = null;
//   }
//   currentPage--;
//   generateTable(currentPage, lastFilteredId);

//   if (currentPage === 1) {
//     document.getElementById("prevBtn")?.setAttribute("disabled", "true");
//   } else {
//     document.getElementById("prevBtn")?.removeAttribute("disabled");
//     document.getElementById("nextBtn")?.removeAttribute("disabled");
//   }
// });

// // Handle Next button click
// document.getElementById("nextBtn")?.addEventListener("click", () => {
//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   if (!filterInput.value) {
//     lastFilteredId = null;
//   }
//   currentPage++;
//   generateTable(currentPage, lastFilteredId);

//   document.getElementById("prevBtn")?.removeAttribute("disabled");
//   if (currentPage * recordsPerPage >= totalRecords) {
//     document.getElementById("nextBtn")?.setAttribute("disabled", "true");
//   }
// });

  



//   // Filter functionality
//   let errorTimeout: number | null = null;

//   const filterInput = document.getElementById("filterInput") as HTMLInputElement;
//   const errorMessage = document.getElementById("errorMessage");

//   if (filterInput && errorMessage) {
//     filterInput.addEventListener("input", async function() { // Added async here to call await later
//       const query = this.value.trim();

//       // Clear any existing timeout and error message
//       if (errorTimeout !== null) {
//         clearTimeout(errorTimeout);
//       }
//       errorMessage.textContent = "";

//       if (query === "") {
//         // If input is empty, remove the highlight and revert the table
//         lastFilteredId = null;
//         currentPage = 1; // Resetting to the first page
//         await generateTable(currentPage, null, undefined); // Use currentPage which is now 1
//         document.getElementById("prevBtn")?.setAttribute("disabled", "true");
//         return;
//       }
      
//       const isValidNumber = /^[0-9]+$/.test(query) && parseInt(query, 10) <= 999999;

//       if (isValidNumber) {
//         lastFilteredId = query;
//         filterRecordsById(query);
//       } else {
//         // Set up the delayed message
//         errorTimeout = setTimeout(() => {
//           errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999999.";
//         }, 500);
//       }
//     });
//   }
// };




// function generateInitialTable() {
//   generateTable(currentPage, null);
// }



// function removeRowsFromTable(rowsToRemove: number) {
//   const table = document.getElementById('myTable');
//   if (table) {
//     const tbody = table.querySelector('tbody');
//     if (tbody) {
//       // Remove the last 'rowsToRemove' rows from the table
//       for (let i = 0; i < rowsToRemove; i++) {
//         if (tbody.lastElementChild) {
//           tbody.removeChild(tbody.lastElementChild);
//         }
//       }
//     }
//   }
// }

//   // Debounce function
//   function debounce(func: Function, wait: number) {
//     let timeout: ReturnType<typeof setTimeout>;
//     return function executedFunction(...args: any[]) {
//       const later = () => {
//         clearTimeout(timeout);
//         func(...args);
//       };
//       clearTimeout(timeout);
//       timeout = setTimeout(later, wait);
//     };
// }




//   // Calculate the number of records to display on each page based on the window height
//   function calculateRecordsPerPage() {
//     const headingHeight = document.getElementById('main-heading')?.offsetHeight || 0; 
//     const paginationHeight = document.getElementById('pagination')?.offsetHeight || 0;  
//     const availableHeight = window.innerHeight - headingHeight - paginationHeight - 10;
//     recordsPerPage = Math.floor(availableHeight / ROW_HEIGHT);
//     totalPages = Math.ceil(totalRecords / recordsPerPage);
//     console.log("In calculateRecordsPerPage:");
//     console.log(`Records per page: ${recordsPerPage}`);
//   }




//   // Fetch columns and cache them if they are not already cached
//   async function fetchColumnData() {
//     if (cachedColumnNames !== null) {
//       return cachedColumnNames;
//     }
//     const response = await fetch("http://localhost:2050/columns");
//     const columnNames = await response.json();
//     cachedColumnNames = columnNames;  // Store in cache
//     return columnNames;
//   }
  
  


//   // Generate the header of the table
//   function generateTableHeader(columnNames: string[]) {
//     const thead = document.createElement('thead');
//     const tr = document.createElement('tr');
//     columnNames.forEach((name) => {
//       const th = document.createElement('th');
//       th.textContent = name;
//       tr.appendChild(th);
//     });
//     thead.appendChild(tr);
//     return thead;
//   }




//   // Fetch a subset of row data from the server
//   async function fetchRowData(from: number, to: number) {
//     // Make sure 'to' doesn't exceed the maximum allowed record number
//     to = Math.min(to, 999999);
    
//     // Make sure 'to' is not negative
//     if (to < 0) {
//       to = 0;
//     }
    
//     // Make sure 'from' is not greater than 'to'
//     if (from > to) {
//       from = to;
//     }
  
//     // Ensure 'from' is not negative
//     if (from < 0) {
//       from = 0;
//     }
  
//     const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
    
//     if (!response.ok) {
//       console.error(`Fetch failed: ${response.status} ${response.statusText}`);
//       return [];
//     }
    
//     const records = await response.json();
//     return records;
//   }
  
  
  

//   // Generate the body of the table
//   function generateTableRows(records: any[][], highlightId: string | null) {
//     const tbody = document.createElement('tbody');
//     records.forEach((record, index) => {
//       const tr = document.createElement('tr');
//       tr.id = `row-${record[0]}`;  // Assuming the ID is the first cell in each record
      
//       // Highlight the row if it matches the filtered ID
//       if (highlightId && highlightId === record[0].toString()) {
//         tr.classList.add("highlighted-green");
//       }
//       record.forEach((cell) => {
//         const td = document.createElement('td');
//         td.textContent = cell;
//         tr.appendChild(td);
//       });
//       tbody.appendChild(tr);
//     });
//     return tbody;
//   }




//   // Generate the complete table
//   async function generateTable(page: number, highlightId: string | null, updateMode: boolean = false) {
//     const columnNames = await fetchColumnData();
//     const from = (page - 1) * recordsPerPage;
//     let to = Math.min(page * recordsPerPage, totalRecords) - 1;
//     const records = await fetchRowData(from, to);
  
//     const thead = generateTableHeader(columnNames);
//     const tbody = generateTableRows(records, highlightId);
    
//     // Clear existing data if any
//     const table = document.getElementById('myTable');
//     if (table) {
//       if (updateMode) {
//         const existingTbody = table.querySelector('tbody');
//         if (existingTbody) {
//           tbody.querySelectorAll('tr').forEach((row) => {
//             existingTbody.appendChild(row);
//           });
//         }
//       } else {
//         table.innerHTML = "";
//         table.appendChild(thead);
//         table.appendChild(tbody);
//       }
//     }
//     console.log("In generateTable:");
//     console.log(`Start index: ${from}`);
//     console.log(`End index: ${to}`);
//     // Set column widths
//     setColumnWidths();
    
//     // If there is a filtered ID, you could call some logic here
//     if (lastFilteredId) {
//       // centerHighlightedRow();
//     }
  
//     // Disable or Enable the Next button based on the last record
//     if (to >= totalRecords - 1) {
//       document.getElementById("nextBtn")?.setAttribute("disabled", "true");
//     } else {
//       document.getElementById("nextBtn")?.removeAttribute("disabled");
//     }
//   }
  
  
//   function setColumnWidths(): void {
//     // Assuming your table has an id of "myTable"
//     const table = document.getElementById("myTable");
    
//     if (table) {
//       // Count the number of columns in your table
//       const headerCells = table.querySelectorAll("th");
//       const numCols = headerCells.length;
  
//       // Calculate the width for each column
//       const colWidth = 100 / numCols;
  
//       // Set the width
//       headerCells.forEach((headerCell: Element) => {
//         (headerCell as HTMLElement).style.width = `${colWidth}%`;
//       });
//     }
//   }
  


//   // Fetch the total number of records
//   async function fetchTotalRecords() {
//     const response = await fetch("http://localhost:2050/recordCount");
//     totalRecords = await response.json();
//     totalPages = Math.ceil(totalRecords / recordsPerPage);
//   }




//   // Filter records by ID and regenerate the table accordingly
//   async function filterRecordsById(query: string) {
//     lastFilteredId = query;
//     if (!query) {
//       // Revert to initial state if no query
//       generateTable(1, null);  // Start with the first page
//       document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
//       return;
//     }
  
//     let id = parseInt(query, 10);
  
//     // Calculate the current page based on the filtered ID
//     currentPage = Math.ceil((id + 1) / recordsPerPage);
  
//     // Enable or Disable the Previous button based on the current page
//     if (currentPage > 1) {
//       document.getElementById("prevBtn")?.removeAttribute("disabled");  // Enable the Previous button here
//     } else {
//       document.getElementById("prevBtn")?.setAttribute("disabled", "true");  // Disable the Previous button here
//     }
  
//     console.log(`Fetching records for page ${currentPage} with highlight on ${id}`);
//     await generateTable(currentPage, id.toString());
//   }
  
  



//   // Center the row that is highlighted
//   // function centerHighlightedRow() {
//   //   const highlightedRow = document.querySelector(".highlighted");
//   //   const mainContainer = document.getElementById("main-container"); 
  
//   //   if (highlightedRow && mainContainer) {
//   //     const containerHeight = mainContainer.clientHeight;
//   //     const rowTop = highlightedRow.getBoundingClientRect().top;
//   //     const rowHeight = highlightedRow.clientHeight;
//   //     const scrollPosition = rowTop + mainContainer.scrollTop - (containerHeight / 2) + (rowHeight / 2);
//   //     mainContainer.scrollTop = scrollPosition;
//   //   }
//   // }
  
  
