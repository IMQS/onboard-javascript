//*** Model ***/

/** Manages the application's state for data display, navigation, and search functionalities. */
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

	constructor (apiManager: ApiManager) {
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

	/** Sets up initial state, fetches record count and column names, and adjusts the display window size. */
	async initializeState(): Promise<void> {
		await this.fetchAndStoreTotalRecordCount().catch((error) => {
			console.error("Error in fetchAndStoreTotalRecordCount:", error);
			return;
		});
	
		await this.retrieveColumnNames().catch((error) => {
			console.error("Error in retrieveColumnNames:", error);
			return;
		});
	
		try {
			this.adjustWindowSize();
		} catch (error) {
			console.error(
				`Error in adjustWindowSize: ${
					error instanceof Error ? error.message : error
				}`
			);
			alert("An error occurred while adjusting the window size. Please try again.");
		}
	}
	
	async retrieveColumnNames(): Promise<void> {
		await this.apiManager.fetchColumnNames().catch((error) => {
			console.error(
				"Error fetching column names from apiManager:",error);
			throw error;
		});

		if (this.apiManager.columnNames !== null) {
			this.columnNames = this.apiManager.columnNames;
		}
	}

	async fetchAndStoreTotalRecordCount(): Promise<void> {
		await this.apiManager.fetchTotalRecordCount().catch(error => {
			console.error("Error fetching total record count from apiManager:", error);
			throw error;  
		});
	
		this.totalRecordCount = this.apiManager.totalRecordCount;
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
	}
	
	goToPreviousPage(): void {
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
	}
	
	async searchByIdStateChange(id: number): Promise<void> {
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
	
		await this.retrieveRecords().catch(error => {
			console.error("Error retrieving records in searchByIdStateChange:", error);
			throw error;
		});
	}
	
	/** Adjusts the available height based on window size and recalculates the number of rows. */
	adjustWindowSize(): void {
		if (typeof window === "undefined" || !window.innerHeight) {
			throw new Error("Unable to access window dimensions");
		}
	
		// Determine the dynamic height of the header and pagination.
		const mainHeadingElement = document.getElementById("main-heading");
		const paginationElement = document.getElementById("pagination");
	
		if (mainHeadingElement && paginationElement) {
			this.headerHeight =
				mainHeadingElement.clientHeight +
				paginationElement.clientHeight;
		} else {
			throw new Error("Could not find main-heading and/or pagination elements");
		}
	
		if (!this.rowHeight) {
			throw new Error("Row height is not properly configured");
		}
	
		this.availableHeight =
			window.innerHeight - this.headerHeight - this.rowHeight * 2;
		this.numRows = Math.floor(this.availableHeight / this.rowHeight);
	
		if (this.numRows <= 0) {
			console.log("Window size too small, setting minimum number of rows to 1");
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
		// to enable priority functionality (always visible in the window).
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
	}
	
	async retrieveRecords(): Promise<void> {
		this.records = await this.apiManager
			.fetchRecords(this.from, this.to)
			.catch((error) => {
				console.error(
					`Error fetching records: ${
						error instanceof Error ? error.message : error
					}`
				);
				throw error;
			});
	}
}
