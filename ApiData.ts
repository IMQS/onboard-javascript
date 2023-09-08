/** class to manage data and settings on the grid */
class ApiData {
	// Properties to manage data and settings
	pageSize: number;
	currentPage: number = 1;
	data: GridData[] = [];
	totalItems: number = 0;
	columnNames: ColumnName[] = [];
	maxGridHeight: number = 0;
	firstVal: number = 0;
	lastVal: number = -1;

	constructor(pageSize: number) {
		this.pageSize = pageSize;
	}

	/** Initialize method to set up the grid */
	async initialize(): Promise<void> {
		Promise.resolve()
			.then(() => this.adjustGridHeight())
			.then(() => this.recordCount())
			.then(() => this.fetchColumns())
			.then(() => this.fetchRecords())
			.then(() => this.setupControls())
	}

	/**Method to fetch total record count from the server */
	recordCount(): Promise<void> {
		return this.fetchData('http://localhost:2050/recordCount')
			.then((response: any) => {
				const totalItems = response;
				this.totalItems = totalItems;
			})
			.catch(() => {
				throw ('Failed to fetch record count.');
			});
	}

	/**fectch column names*/
	fetchColumns(): Promise<void> {
		return this.fetchData('http://localhost:2050/columns')
			.then((response: any) => {
				const res = JSON.parse(response);
				this.columnNames = res.map((columnName: any) => ({ name: columnName }));
				this.data = new Array<GridData>(this.columnNames.length);
			})
			.catch(() => {
				throw ('Failed to fetch columns.');
			});
	}

	/**get records from API for fetch and search functionality*/
	fetchAndProcessRecords(from: number, to: number): Promise<GridData[]> {
		$('#spinner').show();
		$('#grid').hide();

		return this.fetchData(`http://localhost:2050/records?from=${from}&to=${to}`)
			.then((response: any) => {
				const res = JSON.parse(response);
				const processedData = res.map((record: any) => {
					const obj: GridData = {};
					for (let j = 0; j < this.columnNames.length && j < record.length; j++) {
						obj[this.columnNames[j].name] = record[j];
					}
					return obj;
				});
				$('#spinner').hide();
				$('#grid').show();
				return processedData;
			})
			.catch(() => {
				throw ('Failed to fetch records');
			});
	}

	/**fetch records from api*/
	fetchRecords(): Promise<void> {
		const maxRange = this.totalItems - 1;
		const from = this.firstVal;
		let to = Math.min(from + this.pageSize, maxRange);

		if (to >= maxRange) {
			// Set currentPage to the last page
			this.currentPage = Math.floor(maxRange / this.pageSize) + 1;
			to = maxRange;
		}

		return this.fetchAndProcessRecords(from, to)
			.then((processedData) => {
				this.data = processedData;
				this.displayRecords();
				this.updatePageInfo();
			})
			.catch(() => {
				throw ('Failed to fetch records');
			});
	}

	/**funtion to search through records using fromID*/
	searchRecords(searchValue: number): Promise<void> {
		// Maximum allowed Value
		const maxRange = this.totalItems - 1;

		if (searchValue >= 0 && searchValue <= maxRange) {
			const from = searchValue;
			const to = Math.min(from + this.pageSize, maxRange);

			return this.fetchAndProcessRecords(from, to)
				.then((processedData) => {
					this.data = processedData;
					this.currentPage = Math.ceil(from / this.pageSize) + 1;
					// Set firstVal to searched value
					this.firstVal = from;
					// Calculate lastVal based on pageSize
					this.lastVal = from + this.pageSize - 1;
					this.displayRecords();
					this.updatePageInfo();
				})
				.catch(() => {
					throw ('Failed to search value');
				});
		} else {
			alert('Please enter values in the range (0-999999)');
			return Promise.resolve();
		}
	}

	/**  use Ajax for data fetching*/
	private async fetchData(url: string): Promise<number | string> {
		$('#overlay').show();
		const response = await $.ajax({
		  url,
		  method: 'GET',
		});
		$('#overlay').hide();
		return response;
	}

	/**change grid height according to screen size*/
	private adjustGridHeight(): void {
		const gridElement = document.getElementById('grid');
		const pageCntrl = $('.grid-controls').innerHeight();
		const screenHeight = $(window).innerHeight();
		if (gridElement && pageCntrl !== undefined && screenHeight !== undefined) {
			this.maxGridHeight = screenHeight - pageCntrl;
			gridElement.style.height = `${this.maxGridHeight}px`;
		};
	}

	/** Update the page information and records display based on the current state of the grid.*/
	private updatePageInfo(): void {
		const totalPages = Math.ceil(this.totalItems / this.pageSize);
		const pageInfo = `Page ${this.currentPage} of ${totalPages}`;
		const maxRange = this.totalItems - 1;
		const from = this.firstVal;
		let to = Math.min(from + this.pageSize, maxRange);
		$('#pageInfo').text(`${pageInfo}`);
		$('.records').text(`Showing records ${from} to ${to}`);
	}

	
	private setupControls(): void {
		$('#prevBtn').on('click', () => this.handlePageChange(-1));
		$('#nextBtn').on('click', () => this.handlePageChange(1));
		$(window).on('resize', debounce(this.handleResize, 100));
	}

	private handlePageChange(delta: number): void {

		if (delta > 0 && this.firstVal + delta * this.pageSize > this.totalItems - 1) {
			this.firstVal = 0;
		} else if (delta < 0 && this.firstVal + delta * this.pageSize < 0) {
			this.firstVal = Math.max(0, this.totalItems - this.pageSize);
		} else {
			this.firstVal = Math.max(0, Math.min(this.firstVal + delta * this.pageSize, this.totalItems - 1));
		}

		this.lastVal = this.firstVal + this.pageSize ;
		this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;
		this.fetchRecords();
		this.updatePageInfo();
	}

	private handleResize = (): void => {
		const newGridSize = Math.floor((Math.floor(<number>($(window).innerHeight())) * GRID_RATIO) / ROW_HEIGHT);

		// Check if the new grid size is non-negative
		if (newGridSize >= 0) {
			// Adjust firstVal for the last page
			if (this.firstVal + newGridSize > this.totalItems) {
				this.firstVal = Math.max(this.totalItems - newGridSize);
			}

			this.pageSize = newGridSize;
			this.lastVal = this.firstVal + newGridSize - 1;

			// Fetch records, update page info, and adjust grid height
			this.fetchRecords();
			this.updatePageInfo();
			this.adjustGridHeight();
		}
	}

	private displayRecords = (): void => {
		const gridTemplate = new GridTemplate(this.columnNames, this.data);
		gridTemplate.displayRecords();
		this.updatePageInfo();
	}
}
