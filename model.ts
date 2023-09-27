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
    try {
      await this.fetchAndStoreTotalRecordCount();
      await this.retrieveColumnNames();
      this.adjustWindowSize();
    } catch (error) {
      console.error("Error in initializeState:", error);
    }
  }

  async retrieveColumnNames(): Promise<void> {
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
    return this.columnNames;
  }

  getRecords(): CityData[] | null {
    return this.records;
  }

  getFrom(): number {
    return this.from;
  }

  setFrom(value: number): void {
    this.from = value;
  }

  getTo(): number {
    return this.to;
  }

  setTo(value: number): void {
    this.to = value;
  }

  goToNextPage(): void {
    try {
      const from = this.getFrom();
      const to = this.getTo();
      const recordsPerPage = this.numRows;

      const newFrom = from + recordsPerPage;
      const newTo = newFrom + recordsPerPage - 1;

      // Check that 'to' does not exceed totalRecordCount.
      if (newTo >= this.totalRecordCount) {
        this.setTo(this.totalRecordCount - 1);
        this.setFrom(this.totalRecordCount - recordsPerPage);
      } else {
        this.setFrom(newFrom);
        this.setTo(newTo);
      }
    } catch (error) {
      console.error(
        `Unexpected error in goToNextPage: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  goToPreviousPage(): void {
    try {
      const from = this.getFrom();
      const to = this.getTo();
      const recordsPerPage = this.numRows;

      const newFrom = from - recordsPerPage;
      const newTo = newFrom + recordsPerPage - 1;

      // Check that 'from' does not exceed 0.
      if (newFrom < 0) {
        this.setFrom(0);
        this.setTo(recordsPerPage - 1);
      } else {
        this.setFrom(newFrom);
        this.setTo(newTo);
      }
    } catch (error) {
      console.error(
        `Error in goToPreviousPage: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async searchByIdStateChange(id: number): Promise<void> {
    try {
      const newFrom = id;
      const newTo = id + this.numRows - 1;
      const recordsPerPage = this.numRows;

      // Checking that 'to' does not exceed totalRecordCount.
      if (newTo >= this.totalRecordCount) {
        this.setTo(this.totalRecordCount - 1);
        this.setFrom(this.totalRecordCount - recordsPerPage);
      } else {
        this.setTo(newTo);
        this.setFrom(newFrom);
      }

      await this.retrieveRecords();
    } catch (error) {
      console.error(
        `Error in searchByIdStateChange: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
  // Adjusts the available height based on window size and recalculates the number of rows.
  adjustWindowSize(): void {
    try {
      if (typeof window === "undefined" || !window.innerHeight) {
        throw new Error("Unable to access window dimensions");
      }

      // Determine the dynamic height of the header and pagination.
      const mainHeadingElement = document.getElementById("main-heading");
      const paginationElement = document.getElementById("pagination");

      if (mainHeadingElement && paginationElement) {
        this.headerHeight =
          mainHeadingElement.clientHeight + paginationElement.clientHeight;
      } else {
        console.error("Could not find main-heading and/or pagination elements");
      }
      if (!this.rowHeight) {
        throw new Error("Row height is not properly configured");
      }

      this.availableHeight =
        window.innerHeight - this.headerHeight - this.rowHeight * 2;
      this.numRows = Math.floor(this.availableHeight / this.rowHeight);

      if (this.numRows <= 0) {
        console.log(
          "Window size too small, setting minimum number of rows to 1"
        );
        this.numRows = 1;
      }

      // Calculating new values without modifying the state immediately.
      let newFrom = this.from;
      let newTo = this.from + this.numRows - 1;

      // If it's the first set of records ("first page"), start from 0 and populate the whole window size.
      if (this.from === 0) {
        newFrom = 0;
        newTo = this.numRows - 1;
      }

      // Ensure `newTo` doesn't exceed totalRecordCount and adjust `newFrom` accordingly,
      // meaning populate the whole window size.
      if (newTo >= this.totalRecordCount) {
        newTo = this.totalRecordCount - 1;
        newFrom = newTo - this.numRows + 1;
      }

      // Check if the highlighted ID is currently between from and to,
      // too enable priority functionality (always visible in the window).
      const highlightedId = this.getHighlightedId();
      if (
        highlightedId !== null &&
        highlightedId >= this.from &&
        highlightedId <= this.to
      ) {
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
      console.error(
        `Error in adjustWindowSize: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async retrieveRecords(): Promise<void> {
    try {
      this.records = await this.apiManager.fetchRecords(this.from, this.to);
    } catch (error) {
      console.error(
        `Error retrieving records: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
