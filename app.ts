class InitializeApp {
	IMQS: string = "http://localhost:2050";
	/** Current value of the first record being displayed */
	currentValueOfFirstRecord: number = 0;
	/** Index of the first record currently displayed on the page */
	currentFirstRecordIndex: number = 0;
	/** Current page number (changes dynamically) */
	currentPage: number = 1;
	/** Total number of pages available (changes dynamically) */
	totalPages: number = 1;
	/** Default number of records to display per page (changes on screen size) */
	recordsPerPage: number = 16;
	/** Index of the record being searched for (null if not searching) */
	searchedIndex: number | null = null;
	/** Checks if the button is enabled/disabled */
	isButtonDisabled: boolean = false;

	constructor() {
		$(window).on("resize", this.debounce(() => {
			this.updateScreen();
		}, 250));
		this.fetchColumns();
		this.updateScreen();
		this.eventHandlers();
	}

	/** Fetch the total number of records from the server */
	totalRecords(): Promise<number> {
		return fetch(`${this.IMQS}/recordCount`)
			.then(recordCountResponse => {
				if (!recordCountResponse.ok) {
					throw new Error('Error trying to get recordCount');
				}
				return recordCountResponse.text();
			})
			.then(recordCountData => {
				return parseInt(recordCountData);
			})
			.catch(error => {
				throw error;
			});
	}

	/** Fetch column names and create them as table headings */
	fetchColumns(): Promise<string[]> {
		return fetch(`${this.IMQS}/columns`)
			.then(columnsResponse => {
				if (!columnsResponse.ok) {
					throw new Error('Error trying to fetch the columns');
				}
				return columnsResponse.json();
			})
			.then((columns: string[]) => {
				const tableHeaderRow = $("#tableHeaderRow");
				for (const columnName of columns) {
					const th = $("<th>").text(columnName);
					tableHeaderRow.append(th);
				}
				return columns;
			})
			.catch(error => {
				throw error;
			});
	}

	/** Fetch records within a specified range */
	fetchRecords(fromRecord: number, toRecord: number): Promise<string[]> {
		if (fromRecord > toRecord) {
			return Promise.reject(new Error('Invalid arguments: fromRecord cannot be greater than toRecord'));
		}
		return fetch(`${this.IMQS}/records?from=${fromRecord}&to=${toRecord}`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
	}

	/** Display data within the specified range */
	displayData(fromRecord: number, recordsDisplayed: number): void {
		$("#loader").show();
		$("#tableWrapper").hide();
		const adjustedFromRecord = Math.max(fromRecord, 0);
		this.totalRecords()
			.then(recordCount => {
				this.totalPages = Math.ceil(recordCount / this.recordsPerPage);
				//  Ensure that the current page is not greater than the total pages 
				if (this.currentPage > this.totalPages) {
					this.currentPage = this.totalPages;
					this.currentFirstRecordIndex = Math.max(0, (this.currentPage - 1) * this.recordsPerPage);
				}
				const maxToRecord = Math.min(adjustedFromRecord + recordsDisplayed - 1, recordCount - 1);
				//  Check if the calculated range exceeds the total records 
				if (maxToRecord < adjustedFromRecord) {
					throw new Error('No valid records found');
				}
				return this.fetchRecords(adjustedFromRecord, maxToRecord);
			})
			.then(data => {
				let tableData = "";
				if (data && data.length > 0) {
					this.currentValueOfFirstRecord = parseInt(data[0][0]);
					this.currentFirstRecordIndex = adjustedFromRecord;
					for (const record of data) {
						tableData += "<tr>";
						for (const value of record) {
							tableData += `<td>${value}</td>`;
						}
						tableData += "</tr>";
					}
				} else {
					throw new Error('No valid records found');
				}
				$("#tableBody").html(tableData);
				$("#loader").hide();
				$("#tableWrapper").show();
			})
			.catch(error => {
				throw error;
			});
	}

	/** Handle the search method */
	async searchMethod(searchValue: number): Promise<void> {
		try {
			const totalRecCount = await this.totalRecords();
			if (searchValue < 0 || searchValue >= totalRecCount) {
				window.alert('Record not found on this database');
				return;
			}
			const lastRecordIndex = totalRecCount - 1;
			const searchIndex = Math.min(searchValue, lastRecordIndex);
			const targetPage = Math.ceil((searchIndex + 1) / this.recordsPerPage);
			const fromRecord = Math.max(searchIndex - this.recordsPerPage, 0);
			const toRecord = Math.min(fromRecord + this.recordsPerPage, lastRecordIndex);
			const records = await this.fetchRecords(fromRecord, toRecord);
			let foundIndex = -1;
			for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
				const idValue = parseInt(records[recordIndex][0]);
				if (idValue === searchValue) {
					foundIndex = fromRecord + recordIndex;
					break;
				}
			}
			if (foundIndex !== -1) {
				this.searchedIndex = foundIndex;
				this.currentPage = targetPage;
				this.currentFirstRecordIndex = (targetPage - 1) * this.recordsPerPage;
				this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
			} else {
				this.searchedIndex = null;
				window.alert("Record not found");
			}
			$("#prevPageButton").show();
			if (targetPage === this.totalPages) {
				$("#nextPageButton").hide();
			} else {
				$("#nextPageButton").show();
			}
		} catch {
			throw new Error('Error while trying to display the data');
		}
	}

	/** Update the screen layout and data display */
	updateScreen(): void {
		const newScreenHeight = window.innerHeight;
		this.recordsPerPage = this.windowAdjustments(newScreenHeight);
		$("#loader").show();
		$("#tableWrapper").hide();
		this.totalRecords()
			.then(totalRecCount => {
				let fromRecord: number;
				if (this.searchedIndex !== null) {
					const searchPageIndex = this.searchedIndex % this.recordsPerPage;
					const firstRecordOfCurrentPage = (this.currentPage - 1) * this.recordsPerPage;
					if (searchPageIndex >= firstRecordOfCurrentPage && searchPageIndex < firstRecordOfCurrentPage + this.recordsPerPage) {
						fromRecord = firstRecordOfCurrentPage;
					} else {
						this.currentPage = Math.ceil((this.searchedIndex + 1) / this.recordsPerPage);
						this.currentFirstRecordIndex = Math.max(this.searchedIndex - this.recordsPerPage + 1, 0);
						fromRecord = this.currentFirstRecordIndex;
					}
				} else {
					const previousFirstRecordIndex = this.currentFirstRecordIndex;
					this.currentPage = Math.ceil((this.currentFirstRecordIndex + 1) / this.recordsPerPage);
					fromRecord = this.currentFirstRecordIndex;
				}
				if (this.currentPage * this.recordsPerPage > totalRecCount - 1) {
					const lastPage = Math.ceil(totalRecCount / this.recordsPerPage);
					this.currentPage = lastPage;
					this.currentFirstRecordIndex = (lastPage - 1) * this.recordsPerPage;
					fromRecord = this.currentFirstRecordIndex;
				}
				return this.displayData(fromRecord, this.recordsPerPage);
			})
			.then(() => {
				$("#loader").hide();
				$("#tableWrapper").show();
				if (this.currentFirstRecordIndex <= 0) {
					$("#prevPageButton").hide();
				} else {
					$("#prevPageButton").show();
				}
			})
			.catch(() => {
				throw new Error('Error updating screen:');
			});
	}

	/** Adjust the number of records displayed based on screen height */
	windowAdjustments(screenHeight: number): number {
		const estimatedRowHeightFactor = 1;
		const estimatedRowHeight = estimatedRowHeightFactor * 50;
		const availableScreenHeight = screenHeight - 140;
		const recordsPerPage = Math.floor(availableScreenHeight / estimatedRowHeight);
		// This ensures that will at least be 1 record on display 
		return Math.max(recordsPerPage, 1);
	}

	/** Create a debounce function to delay function execution */
	debounce(func: any, delay: number) {
		let timeoutId: any;
		return function (...args: any) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func(...args);
			}, delay);
		};
	}

	/** Handles the events such as pagination buttons, input handling and search form */
	eventHandlers(): void {
		/* Prevent certain keys in the search input */
		$("#searchInput").on("keydown", (e) => {
			if (e.key === "e" || e.key === "E" || e.key === "."
				|| e.key === "+" || e.key === "-") {
				e.preventDefault();
			}
		});

		/* Handle form submission for searching */
		$("#searchForm").submit((e) => {
			e.preventDefault();
			const searchInputValue = <string>$("#searchInput").val();
			const searchValue = Number(searchInputValue);
			this.searchedIndex = null;
			this.searchMethod(searchValue)
				.then(() => {
					$("#tableWrapper").hide();
					$("#loader").show();
				})
				.catch(() => {
					window.alert('An error occurred during search. Please try again.');
					$("#loader").hide();
					$("#tableWrapper").show();
				});
		});

		/* Handle previous page button click */
		$("#prevPageButton").on("click", () => {
			if ($("#prevPageButton").hasClass("hidden")) {
				return;
			}
			$("#prevPageButton").addClass("hidden");
			this.searchedIndex = null;
			const firstRecordOfCurrentPage = (this.currentPage - 1) * this.recordsPerPage;
			let fromRecord = firstRecordOfCurrentPage;
			$("#nextPageButton").hide();
			$("#prevPageButton").hide();
			$("#tableWrapper").hide();
			$("#loader").show();
			this.totalRecords()
				.then(() => {
					$("#prevPageButton").removeClass("hidden");
					$("#loader").hide();
					$("#tableWrapper").show();
					$("#nextPageButton").show();
					$("#prevPageButton").show();
					if (this.currentFirstRecordIndex <= 0) {
						$("#prevPageButton").hide();
					} else if (this.currentPage < this.totalPages) {
						$("#nextPageButton").show();
					}
				})
				.then(() => {
					if (firstRecordOfCurrentPage <= this.recordsPerPage) {
						this.currentPage = 1;
						this.currentFirstRecordIndex = 0;
					} else {
						this.currentPage--;
						this.currentFirstRecordIndex -= this.recordsPerPage;
					}
					fromRecord = this.currentFirstRecordIndex;
					return this.displayData(fromRecord, this.recordsPerPage);
				})
				.catch(() => {
					throw new Error('Error while trying go to the previous page');
				});
		});

		/* Handle next page button click */
		$("#nextPageButton").on("click", () => {
			if ($("#nextPageButton").hasClass("hidden")) {
				return;
			}
			if (this.currentPage >= this.totalPages) {
				const errorMessage = "Already on the last page";
				window.alert(errorMessage);
				return;
			}
			$("#nextPageButton").addClass("hidden");
			this.searchedIndex = null;
			let fromRecord = this.currentFirstRecordIndex;
			$("#nextPageButton").hide();
			$("#prevPageButton").hide();
			$("#tableWrapper").hide();
			$("#loader").show();
			this.totalRecords()
				.then((totalRecCount: number) => {
					$("#nextPageButton").removeClass("hidden");
					$("#loader").hide();
					$("#tableWrapper").show();
					$("#nextPageButton").show();
					$("#prevPageButton").show();
					if (typeof totalRecCount === 'number' && this.currentFirstRecordIndex >= totalRecCount) {
						$("#nextPageButton").hide();
					}
				})
				.then(() => {
					if (this.currentPage < this.totalPages) {
						this.currentPage++;
						this.currentFirstRecordIndex += this.recordsPerPage;
					} else {
						this.currentPage = this.totalPages;
					}
					fromRecord = this.currentFirstRecordIndex;
					return this.displayData(fromRecord, this.recordsPerPage);
				})
				.catch(() => {
					throw new Error('Error while trying go to the next page');
				});
		});
	}
}

window.onload = () => {
	$("#loader").hide();
	new InitializeApp();
};
