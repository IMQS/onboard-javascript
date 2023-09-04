class ApiData {
	// Properties to manage data and settings
	pageSize: number;
	currentPage = 1;
	data: GridData[] = [];
	totalItems = 0;
	columnNames: ColumnName[] = [];
	maxGridHeight = 0;
	firstVal = 0;
	lastVal: number | undefined;

	constructor(pageSize: number) {
		this.pageSize = pageSize;
	};
	// Initialize method to set up the grid
	async initialize(): Promise<void> {
		try {
			this.adjustGridHeight();
			await this.recordCount();
			await this.fetchColumns();
			await this.fetchRecords();
			this.setupControls();
		} catch (error) {
			console.error('Error during initialization:', error);
		}
	}
	// Method to fetch total record count from the server
	async recordCount(): Promise<void> {
		try {
			const response = await this.fetchData('http://localhost:2050/recordCount');
			this.totalItems = typeof response === 'number' ? response : parseInt(response as string, 10);
		} catch (error) {
			throw new Error('Failed to fetch record count.');
		}
	}
	//fectch column names
	async fetchColumns(): Promise<void> {
		try {
			const response = await this.fetchData('http://localhost:2050/columns');
			const res = JSON.parse(response as string);
			this.columnNames = res.map((columnName: any) => ({ name: columnName }));
			this.data = new Array<GridData>(this.columnNames.length);
		} catch (error) {
			throw new Error('Failed to fetch columns.');
		}
	};
	//get records from API for fetch an search functionality 
	async fetchAndProcessRecords(from: number, to: number): Promise<GridData[]> {
		try {
			$('#spinner').show()
			$('#grid').hide();
			const response = await this.fetchData(`http://localhost:2050/records?from=${from}&to=${to}`);
			const res = JSON.parse(response as string);
			const processedData = res.map((record: any) => {
				const obj: GridData = {};
				let columnIndex = 0;
				for (const column of this.columnNames) {
					if (columnIndex < record.length) {
						const columnName = column.name;
						const columnValue = record[columnIndex];
						obj[columnName] = columnValue;
					}
					columnIndex++;
				}
				return obj;
			});
			$('#spinner').hide();
			$('#grid').show();
			return processedData;
		} catch (error) {
			throw new Error('Failed to fetch records');
		}
	}
	//fetch records from api
	async fetchRecords(): Promise<void> {
		const maxRange = this.totalItems - 1;
		const from = this.firstVal;
		let to = Math.min(from + this.pageSize, maxRange);
		if (to >= maxRange) {
			// Set currentPage to the last page
			this.currentPage = Math.floor(maxRange / this.pageSize) + 1;
			to = maxRange;
		};
		try {
			const processedData = await this.fetchAndProcessRecords(from, to);
			this.data = processedData;
			this.displayRecords();
			this.updatePageInfo();
		} catch (error) {
			throw new Error('Failed to fetch records')
		};
	}
	//funtion to search through records using fromID
	async searchRecords(searchValue: number): Promise<void> {
		try {
			// Maximum allowed Value
			const maxRange = this.totalItems - 1;
			if (searchValue >= 0 && searchValue <= maxRange) {
				const from = searchValue;
				const to = Math.min(from + this.pageSize, maxRange);
				const processedData = await this.fetchAndProcessRecords(from, to);
				this.data = processedData;
				this.currentPage = Math.ceil(from / this.pageSize) + 1
				// Set firstVal to searched value
				this.firstVal = from;
				// Calculate lastVal based on pageSize
				this.lastVal = from + this.pageSize;
				this.displayRecords();
				this.updatePageInfo();
			} else {
				alert('Please enter values in the range (0-999999)');
			}
		} catch (error) {
			throw new Error('Failed to search value');
		};
	}
	//change grid height according to screen size
	private adjustGridHeight(): void {
		const gridElement = document.getElementById('grid');
		const pageCntrl = $('.grid-controls').innerHeight();
		const screenHeight = $(window).innerHeight();
		if (gridElement && pageCntrl !== undefined && screenHeight !== undefined) {
			this.maxGridHeight = screenHeight - pageCntrl;
			gridElement.style.height = `${this.maxGridHeight}px`;
		};
	}
	// Update the page information and records display based on the current state of the grid.
	private updatePageInfo(): void {
		const totalPages = Math.ceil(this.totalItems / this.pageSize);
		const pageInfo = `Page ${this.currentPage} of ${totalPages}`;
		const maxRange = this.totalItems - 1;
		const from = this.firstVal;
		let to = Math.min(from + this.pageSize, maxRange);
		$('#pageInfo').text(`${pageInfo}`);
		$('.records').text(`Showing records ${from} to ${to}`);
	}
	// use Ajax for data fetching
	private async fetchData(url: string): Promise<number | string> {
		try {
			$('#overlay').show();
			const response = await $.ajax({
				url,
				method: 'GET',
			});
			$('#overlay').hide();
			return response;
		} catch (error) {
			throw error;
		};
	}
	private setupControls(): void {
		$('#prevBtn').on('click', () => this.handlePageChange(-1));
		$('#nextBtn').on('click', () => this.handlePageChange(1));
		$(window).on('resize', debounce(this.handleResize, 350));
	}
	//self explanatory 
	private handlePageChange(delta: number): void {
		const newFirstVal = this.firstVal + delta * this.pageSize;
		// If moving forward and newFirstVal exceeds total items, go to the first page
		if (delta > 0 && newFirstVal > this.totalItems - 1) {
			this.firstVal = 0;
		} else if (delta < 0 && newFirstVal < 0) {
			// If moving backward and newFirstVal goes below 0, go to the last page
			this.firstVal = Math.max(0, this.totalItems - this.pageSize);
		} else {
			this.firstVal = Math.max(0, Math.min(newFirstVal, this.totalItems - 1));
		};
		this.lastVal = this.firstVal + this.pageSize - 1;
		this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;
		this.fetchRecords();
		this.updatePageInfo();
	}
	//for resizing the page 
	private handleResize = (): void => {
		const newWindowHeight = Math.floor($(window).innerHeight() as number);
		const newGridSize = Math.floor((newWindowHeight * gridRatio) / rowHeight) - 1;
		// Check if the new grid size is non-negative
		if (newGridSize >= 0) {
			const newPageSize = newGridSize;
			let newFirstValueIndex = this.firstVal;
			// Adjust firstVal for the last page
			if (newFirstValueIndex + newPageSize > this.totalItems) {
				newFirstValueIndex = Math.max(this.totalItems - newPageSize);
			}
			// Update firstVal, lastVal, and page size
			this.pageSize = newPageSize;
			this.firstVal = newFirstValueIndex;
			this.lastVal = newFirstValueIndex + newPageSize - 1;
			// Fetch records, update page info, and adjust grid height
			this.fetchRecords();
			this.updatePageInfo();
			this.adjustGridHeight();
		};
	}

	private displayRecords = (): void => {
		const gridTemplate = new GridTemplate(this.columnNames, this.data);
		gridTemplate.displayRecords();
		this.updatePageInfo();
	}
}
