// ****************************************************** Data ********************************************************* /

type CityData = [number, string, number];

class ApiManager {
  totalRecordCount: number;
  columnNames: string[] | null;
  
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
  

  async fetchRecords(from: number, to: number): Promise<CityData[] | null> {
    console.log(`Function #12.1 - Executing fetchRecords with from: ${from}, to: ${to}`);
    try {
      const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }
      const data: CityData[] = await response.json();
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
  private records: CityData[] | null = null;
  private columnNames: string[] | null;
  private totalRecordCount = 0;

  highlightedId: number | null = null;

  constructor(apiManager: ApiManager) {
    this.rowHeight = 20; 
    this.headerHeight = 180; 
    this.availableHeight = 0;
    this.numRows = 0;
    this.apiManager = apiManager;
    this.from = 0; 
    this.to = 0; 
    this.columnNames = null;
    this.totalRecordCount = 0;
  }


  async initializeState(): Promise<void> {
    console.log("Function #1 - Executing initialize");
    try {
      await this.fetchAndStoreTotalRecordCount();
      await this.retrieveColumnNames();
      this.adjustWindowSize();
    } catch (error) {
      console.error("Error in initializeState:", error);
    }
  }
  

  async retrieveColumnNames(): Promise<void> {
    console.log("Function #4 - Executing retrieveColumnNames");
    try {
        await this.apiManager.fetchColumnNames();

        if (this.apiManager.columnNames !== null) {
            this.columnNames = this.apiManager.columnNames;
        }
    } catch (error) {
        console.error("Error in retrieveColumnNames:", error);
    }
}
  

  async fetchAndStoreTotalRecordCount(): Promise<void> {
    console.log("Function #2 - Executing fetchAndStoreTotalRecordCount");
    try {
      await this.apiManager.fetchTotalRecordCount();
      this.totalRecordCount = this.apiManager.totalRecordCount;
    } catch (error) {
      console.error("Error in fetchAndStoreTotalRecordCount:", error);
    }
  }
  

  getTotalRecordCount(): number {
    return this.totalRecordCount;
  }
  

  getColumnNames(): string[] | null {
    console.log("Function #10 - Executing getColumnNames");
    return this.columnNames;
  }
  
  
  getRecords(): CityData[] | null {
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
    try {
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
    } catch (error) {
      console.error(`Unexpected error in goToNextPage: ${error instanceof Error ? error.message : error}`);
    }
  }
  

  goToPreviousPage(): void {
    try {
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
    } catch (error) {
      console.error(`Error in goToPreviousPage: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  
  async searchByIdStateChange(id: number): Promise<void> {
    try {
        console.log("Function #24 - Executing searchByIdStateChange");

        const newFrom = id;
        const newTo = id + this.numRows - 1;

        // Checking that 'to' does not exceed totalRecordCount
        if (newTo >= this.totalRecordCount) {
            this.setTo(this.totalRecordCount - 1);
        } else {
            this.setTo(newTo);
        }
        this.setFrom(newFrom);
        await this.retrieveRecords();

    } catch (error) {
        console.error(`Error in searchByIdStateChange: ${error instanceof Error ? error.message : error}`);
    }
}

  
  adjustWindowSize(): void {
    console.log("Function #6 - Executing adjustWindowSize");

    try {
        if (typeof window === "undefined" || !window.innerHeight) {
            throw new Error("Unable to access window dimensions");
        }

        if (!this.rowHeight) {
            throw new Error("Row height is not properly configured");
        }

        this.availableHeight = window.innerHeight - this.headerHeight;
        this.numRows = Math.floor(this.availableHeight / this.rowHeight);

        if (this.numRows <= 0) {
            console.log("Window size too small, setting minimum number of rows to 1");
            this.numRows = 1;
        }

        if (this.from === 0) {
            this.setFrom(0);  // Assuming the first row is always 0
            this.setTo(this.numRows - 1);
        } else {
            this.setTo(this.from + this.numRows - 1);
        }
    } catch (error) {
        console.error(`Error in adjustWindowSize: ${error instanceof Error ? error.message : error}`);
    }
}


async retrieveRecords(): Promise<void> {
  console.log("Function #12 - Executing retrieveRecords");
  try {
      this.records = await this.apiManager.fetchRecords(this.from, this.to);
  } catch (error) {
      console.error(`Error retrieving records: ${error instanceof Error ? error.message : error}`);
  }
}
}

// ****************************************************** View ********************************************************* /


class TableRenderer {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async initialRender(stateManager: StateManager): Promise<void> {
    try {
        console.log("Function #9 - Executing initialRender");

        const columnNames = stateManager.getColumnNames();
        if (columnNames !== null) {
            this.renderColumnNames(columnNames);
        }

        await stateManager.retrieveRecords();
        const records = stateManager.getRecords();

        if (records !== null) {
            this.renderRecords(records);
        }
    } catch (error) {
        console.error(`Error during initialRender: ${error}`);
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

      this.setColumnWidths();
    } catch (error) {
      if (error instanceof Error) {  
        console.error(`An error occurred: ${error.message}`);
      } else {
        console.error(`An unknown error occurred: ${error}`);
      }
    }
  }


  setColumnWidths(): void {
    console.log("Function #11.1 - Executing setColumnWidths");
    try {
      const table = document.getElementById("myTable");
      
      if (!table) {
        throw new Error('Table with id "myTable" not found.');
      }

      const headerCells = table.querySelectorAll("th");
      const numCols = headerCells.length;
      const colWidth = 100 / numCols;
    
      headerCells.forEach((headerCell: Element) => {
        (headerCell as HTMLElement).style.width = `${colWidth}%`;
      });
    } catch (error) {
      console.error(`Error setting column widths: ${error}`);
    }
}


  renderRecords(records: CityData[] | null, highlightId: number | null = null) {
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
      
      tbody.innerHTML = ''; 
      
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
}


// ****************************************************** Controllers ********************************************************* /


class WindowResizeHandler {
  private debouncedUpdate: Function;

  constructor(
      private tableRenderer: TableRenderer,
      private stateManager: StateManager
  ) {
      this.debouncedUpdate = this.debounce(this.updateAfterResize.bind(this), 350);

      // Attach event listener here
      this.setupEventListeners();
  }

  private setupEventListeners(): void {
      window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
      console.log("Function #15 - Executing handleResize");
      this.debouncedUpdate();
  }

  debounce(func: Function, delay: number): Function {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      return (...args: any[]) => {
          const later = () => {
              timeout = null;
              func(...args);
          };
          if (timeout !== null) {
              clearTimeout(timeout);
          }
          timeout = setTimeout(later, delay);
      };
  }

  async updateAfterResize() {
    try {
      console.log("Update after resize");
      this.stateManager.adjustWindowSize();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();

      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }
    } catch (error) {
      console.error(`Error in updateAfterResize: ${error instanceof Error ? error.message : error}`);
    }
  }
}


class PaginationManager {
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private searchButton: HTMLButtonElement;
  private mainHeading: HTMLElement;
  private filterInput: HTMLInputElement;
  private errorMessage: HTMLElement;

  constructor(private tableRenderer: TableRenderer, private stateManager: StateManager) {
      this.tableRenderer = tableRenderer;
      this.stateManager = stateManager;

      this.prevButton = document.getElementById("prevPage") as HTMLButtonElement;
      this.nextButton = document.getElementById("nextPage") as HTMLButtonElement;
      this.searchButton = document.getElementById('searchButton') as HTMLButtonElement;
      this.mainHeading = document.getElementById("main-heading") as HTMLElement;
      this.filterInput = document.getElementById('filterInput') as HTMLInputElement;
      this.errorMessage = document.getElementById('errorMessage') as HTMLElement;
      
      // Attach event listeners
      this.setupEventListeners();
  }

  private setupEventListeners(): void {
      if (this.prevButton) {
          this.prevButton.addEventListener("click", () => this.decrementPage());
      }
      
      if (this.nextButton) {
          this.nextButton.addEventListener("click", () => this.incrementPage());
      }

      if (this.searchButton) {
          this.searchButton.addEventListener("click", () => this.searchById());
      }

      if (this.mainHeading) {
          this.mainHeading.addEventListener("click", () => this.navigateToHome());
      }

      if (this.filterInput && this.errorMessage) {
          this.setupLiveValidation();
      }
  }


  navigateToHome(): void {
    console.log("Function #25 - Navigating to Home");
    try {
        window.location.reload();
    } catch (error) {
        console.error(`Error while navigating to home: ${error instanceof Error ? error.message : error}`);
        alert("Failed to reload the page. Please try again.");
    }
  }


  async incrementPage(): Promise<void> {
    try {
      console.log("Function #16 - Executing incrementPage");
      this.stateManager.goToNextPage();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();
  
      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }
      this.updateButtonStates();
    } catch (error) {
      console.error(`Unexpected error in incrementPage: ${error instanceof Error ? error.message : error}`);
    }
  }
  

  async decrementPage(): Promise<void> {
    try {
      console.log("Function #21 - Executing decrementPage");
      
      this.stateManager.goToPreviousPage();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();
      
      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }
      
      this.updateButtonStates();
    } catch (error) {
      console.error(`Error in decrementPage: ${error instanceof Error ? error.message : error}`);
    }
  }
  

  async searchById(): Promise<void> {
    try {
        console.log("Function #23 - Executing searchById");
        
        const searchValue = parseInt(this.filterInput.value, 10);
        if (isNaN(searchValue)) {
            throw new Error('Invalid search value or none');
        }

        this.stateManager.highlightedId = searchValue;
        await this.stateManager.searchByIdStateChange(searchValue);

        const records = this.stateManager.getRecords();
        
        if (records !== null) {
            this.tableRenderer.renderRecords(records, searchValue);
        }

        this.updateButtonStates();
    } catch (error) {
        console.error(`Error in searchById function: ${error instanceof Error ? error.message : error}`);
    }
}


setupLiveValidation(): void {
  this.filterInput.addEventListener('input', () => {
      const inputValue = this.filterInput.value;

      if (inputValue.length === 0) {
          this.errorMessage.textContent = "";
      } else if (inputValue.length < 1 || inputValue.length > 6 || !/^\d+$/.test(inputValue)) {
          this.errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999 999.";
      } else {
          this.errorMessage.textContent = "";
      }
  });
}


private updateButtonStates(): void {
  try {
      console.log("Function #20 - Executing updateButtonstates");
  
      const from = this.stateManager.getFrom();
      const to = this.stateManager.getTo();
      const totalRecordCount = this.stateManager.getTotalRecordCount();
  
      this.prevButton.disabled = from === 0;
      this.nextButton.disabled = to === totalRecordCount - 1;

  } catch (error) {
      console.error(`Unexpected error in updateButtonStates: ${error instanceof Error ? error.message : error}`);
  }
}
}


// ****************************************************** Main Script ********************************************************* /


window.onload = async () => {
  console.log("Event #1 - Executing window.onload");

  // Initialize Data
  const apiManager = new ApiManager(); 

  // Initialize Model
  const stateManager = new StateManager(apiManager); 
  await stateManager.initializeState(); 

  // Initialize View
  const tableRenderer = new TableRenderer(stateManager); 
  await tableRenderer.initialRender(stateManager);

  // Initialize Controllers
  const windowResizeHandler = new WindowResizeHandler(tableRenderer, stateManager); 
  const paginationManager = new PaginationManager(tableRenderer, stateManager); 
  
};


