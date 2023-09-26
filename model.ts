//*** Model ***/

// Manages the application's state for data display, navigation, and search functionalities.
class StateManager {

    private highlightedId: number | null = null;
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
    
    public getHighlightedId(): number | null {
      return this.highlightedId;
    }

    public setHighlightedId(value: number | null): void {
      this.highlightedId = value;
    }

    // Sets up initial state, fetches record count and column names, and adjusts the display window size.
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
        const recordsPerPage = this.numRows;
    
        const newFrom = from + recordsPerPage;
        const newTo = newFrom + recordsPerPage - 1;
    
        // Check that 'to' does not exceed totalRecordCount
        if (newTo >= this.totalRecordCount) {
          this.setTo(this.totalRecordCount - 1);
          this.setFrom(this.totalRecordCount - recordsPerPage); 
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
          const recordsPerPage = this.numRows;
  
          // Checking that 'to' does not exceed totalRecordCount
          if (newTo >= this.totalRecordCount) {
              this.setTo(this.totalRecordCount - 1);
              this.setFrom(this.totalRecordCount - recordsPerPage); 
          } else {
              this.setTo(newTo);
              this.setFrom(newFrom);
          }
          
          await this.retrieveRecords();
  
      } catch (error) {
          console.error(`Error in searchByIdStateChange: ${error instanceof Error ? error.message : error}`);
      }
  }
    // Adjusts the available height based on window size and recalculates the number of rows.
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
  
          // Calculating new values without modifying the state immediately.
          let newFrom = this.from;
          let newTo = this.from + this.numRows - 1;
  
          // If it's the first set of records, start from 0.
          if (this.from === 0) {
              newFrom = 0;
              newTo = this.numRows - 1;
          }
  
          // Ensure `newTo` doesn't exceed totalRecordCount and adjust `newFrom` accordingly.
          if (newTo >= this.totalRecordCount) {
              newTo = this.totalRecordCount - 1;
              newFrom = newTo - this.numRows + 1;
          }

            // Check if the highlighted ID is currently between from and to.
          const highlightedId = this.getHighlightedId(); // Assuming you have a method to get the highlighted ID.
          if (highlightedId !== null && highlightedId >= this.from && highlightedId <= this.to) {
              // If newTo would be smaller than highlightedId, adjust to keep highlightedId in view.
              if (newTo < highlightedId) {
                  newTo = highlightedId;
                  newFrom = newTo - this.numRows + 1;
              }
          }
  
          // Now, after all conditions have been checked, set the state.
          this.setFrom(newFrom);
          this.setTo(newTo);
  
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