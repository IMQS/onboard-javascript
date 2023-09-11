/** Debounce utility function to limit function execution frequency */
function debounce<F extends (...args: any) => any>(func: F, waitFor: number) {
	let timeout: number;

	return (...args: Parameters<F>): Promise<ReturnType<F>> => {
		clearTimeout(timeout);

		return new Promise((resolve) => {
			timeout = setTimeout(() => {
				resolve(func(...args));
			}, waitFor);
		});
	};
}

/** Constants for grid calculation
* GRID_RATIO represents the ratio of the grid's height to the window's height.
*/
const GRID_RATIO = 9 / 20;
const ROW_HEIGHT = 16;

/** manage data and settings on the grid */
class ApiData {

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
	initialize(): Promise<void> {
		this.adjustGridHeight();
		return this.recordCount()
			.then(() => this.fetchColumns())
			.then(() => this.fetchColumns())
			.then(() => this.fetchRecords())
			.then(() => this.setupControls());
	}
	/** Fetch total record count from the server */
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

	/** fectch column names */
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

	/** get records from API for fetch and search functionality */
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

	/** fetch records from api */
	fetchRecords(): Promise<void> {
		const maxRange = this.totalItems - 1;
		let from = this.firstVal;
		let to = Math.min(from + this.pageSize, maxRange);

		if (to >= maxRange) {
			const lastPage = Math.floor(maxRange / this.pageSize) + 1;

			this.currentPage = lastPage;

			to = maxRange;
			from = (lastPage - 1) * this.pageSize + 1;
			this.firstVal = from;
		}

		return this.fetchAndProcessRecords(from, to)
			.then(processedData => {
				this.data = processedData;
				this.displayRecords();
				this.updatePageInfo();
			})
			.catch(() => {
				throw ('Failed to fetch records');
			});
	}

	/** search through records using fromID */
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
			alert(`Please enter values in the range (0-${this.totalItems - 1})`);
			return Promise.resolve();
		}
	}

	/** use Ajax for data fetching */
	private async fetchData(url: string): Promise<number | string> {
		$('#overlay').show();
		const response = await $.ajax({
			url,
			method: 'GET',
		});
		$('#overlay').hide();
		return response;
	}

	/** Change grid height according to screen size */
	private adjustGridHeight(): void {
		const gridElement = document.getElementById('grid');
		const pageCntrl = $('.grid-controls').innerHeight();
		const screenHeight = $(window).innerHeight();
		if (gridElement && pageCntrl !== undefined && screenHeight !== undefined) {
			this.maxGridHeight = screenHeight - pageCntrl;
			gridElement.style.height = `${this.maxGridHeight}px`;
		};
	}

	/** Update the page information and records display based on the current state of the grid. */
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
		let prevBtn = $('#prevBtn');
		let nextBtn = $('#nextBtn');

		if (delta > 0 && this.firstVal + delta * this.pageSize > this.totalItems - 1) {
			this.firstVal = this.lastVal - delta * this.pageSize;
			prevBtn.attr("disabled", null);
			nextBtn.attr("disabled", "disabled");
		} else if (delta < 0 && this.firstVal + delta * this.pageSize < 0) {
			this.firstVal = 0;
			prevBtn.attr("disabled", "disabled");
			nextBtn.attr("disabled", null);
		} else {
			this.firstVal = Math.max(0, Math.min(this.firstVal + delta * this.pageSize, this.totalItems - 1));
			prevBtn.attr("disabled", null);
			nextBtn.attr("disabled", null);
		}

		this.lastVal = this.firstVal + delta * this.pageSize;
		this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;

		this.fetchRecords()
			.then(() => {
				this.updatePageInfo();
			})
			.catch((error) => {
				console.error("Error fetching records while changing page :", error);
				alert('Error occured while changing page!');
			});
	}


	private handleResize = (): void => {
		const newGridSize = Math.floor((Math.floor(<number>($(window).innerHeight())) * GRID_RATIO) / ROW_HEIGHT) - 1;

		// Check if the new grid size is non-negative
		if (newGridSize >= 0) {
			// Adjust firstVal for the last page
			if (this.firstVal + newGridSize > this.totalItems - 1) {
				this.firstVal = Math.min((this.totalItems - 1) - newGridSize);
			}

			this.pageSize = newGridSize;
			this.lastVal = this.firstVal + newGridSize;

			this.adjustGridHeight();

			this.fetchRecords()
				.then(() => {
					this.updatePageInfo();
				})
				.catch((error) => {
					console.error("Error fetching records while resizing:", error);
					alert('Error occured while resizing!');
				});
		}
	}

	private displayRecords = (): void => {
		const gridTemplate = new GridTemplate(this.columnNames, this.data);
		gridTemplate.displayRecords();
		this.updatePageInfo();
	}
}
