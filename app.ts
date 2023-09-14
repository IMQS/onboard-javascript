class InitializeApp {
	IMQS: string = "http://localhost:2050";
	/** Current value of the first record being displayed */
	currentValueOfFirstRecord: number = 0;
	/** Index of the first record currently displayed on the page */
	currentFirstRecordIndex: number = 0;
	/** Current page number (changes dynamically)*/
	currentPage: number = 1;
	/** Total number of pages available (changes dynamically) */
	totalPages: number = 1;
	/** Default number of records to display per page (changes on screen size) */
	recordsPerPage: number = 16;
	/** Index of the record being searched for (null if not searching) */
	searchedIndex: number | null = null;
	/** Checks if the button is enabled/disabled*/
	isButtonDisabled: boolean = false;

	constructor() {
		const loadApp = new Promise<void>((resolve, reject) => {
			window.onload = () => {
				try {
					$("#loader").hide();
					$(window).on("resize", this.debounce(() => {
						this.updateScreen();
					}, 250));
					this.fetchColumns();
					this.updateScreen();
					this.eventHandlers();
					resolve();
				} catch (error) {
					reject(error);
				}
			};
		});
		loadApp
			.catch(() => {
				throw new Error('Error during window.onload:');
			});
	}

	/** Fetch the total number of records from the server */
	totalRecords(): Promise<number> {
		return fetch(`${this.IMQS}/recordCount`)
			.then((recordCountResponse) => {
				if (!recordCountResponse.ok) {
					throw new Error('Error trying to get recordCount');
				}
				return recordCountResponse.json();
			})
			.then((recordCountData) => {
				return recordCountData as number;
			})
			.catch((error) => {
				throw error;
			});
	}

	/** Fetch column names and create them as table headings */
	fetchColumns(): Promise<string[]> {
		return fetch(`${this.IMQS}/columns`)
			.then(columnsResponse => {
				if (!columnsResponse.ok) {
					throw new Error('Error trying to fetch the columns');
					return [];
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
				return [];
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
					return [];
				}
				return response.json();
			})
			.catch(() => {
				return [];
			});
	}

	/** Display data within the specified range */
	displayData(fromRecord: number, recordsDisplayed: number): void {
		$("#loader").show();
		$("#tableWrapper").hide();
		const adjustedFromRecord = Math.max(fromRecord, 0);
		this.totalRecords()
			.then(recordCount => {
				this.totalPages = Math.ceil(recordCount / this.recordsPerPage);
				/**  Ensure that the current page is not greater than the total pages */
				if (this.currentPage > this.totalPages) {
					this.currentPage = this.totalPages;
					this.currentFirstRecordIndex = Math.max(0, (this.currentPage - 1) * this.recordsPerPage);
				}
				const maxToRecord = Math.min(adjustedFromRecord + recordsDisplayed - 1, recordCount - 1);
				/**  Check if the calculated range exceeds the total records */
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
	searchMethod(searchValue: number): void {
		this.totalRecords()
			.then(totalRecCount => {
				if (searchValue < 0 || searchValue >= totalRecCount) {
					window.alert('Record not found on this database');
					return;
				}
				const lastRecordIndex = totalRecCount - 1;
				const searchIndex = Math.min(searchValue, lastRecordIndex);
				const targetPage = Math.ceil((searchIndex + 1) / this.recordsPerPage);
				const fromRecord = Math.max(searchIndex - (this.recordsPerPage), 0);
				const toRecord = Math.min(fromRecord + this.recordsPerPage, lastRecordIndex);
				return this.fetchRecords(fromRecord, toRecord)
					.then((records) => {
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
							return this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
						} else {
							this.searchedIndex = null;
							window.alert("Record not found");
						}
					})
					.then(() => {
						$("#prevPageButton").show();
						if (targetPage === this.totalPages) {
							$("#nextPageButton").hide();
						} else {
							$("#nextPageButton").show();
						}
					})
					.catch((error) => {
						throw error;
					});
			})
			.catch((error) => {
				throw error;
			});
	}

	/** Update the screen layout and data display */
	updateScreen(): void {
		const newScreenHeight = window.innerHeight;
		this.recordsPerPage = this.windowAdjustments(newScreenHeight);
		$("#loader").show();
		$("#tableWrapper").hide();
		const totalRecCountPromise = this.totalRecords();
		totalRecCountPromise
			.then(() => {
				if (this.searchedIndex !== null) {
					const searchPageIndex = this.searchedIndex % this.recordsPerPage;
					const firstRecordOfCurrentPage = (this.currentPage - 1) * this.recordsPerPage;
					if (searchPageIndex >= firstRecordOfCurrentPage && searchPageIndex < firstRecordOfCurrentPage + this.recordsPerPage) {
						return this.displayData(firstRecordOfCurrentPage, this.recordsPerPage);
					} else {
						this.currentPage = Math.ceil((this.searchedIndex + 1) / this.recordsPerPage);
						this.currentFirstRecordIndex = Math.max(this.searchedIndex - this.recordsPerPage + 1, 0);
						return this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
					}
				} else {
					const previousFirstRecordIndex = this.currentFirstRecordIndex;
					this.currentPage = Math.ceil((this.currentFirstRecordIndex + 1) / this.recordsPerPage);
					return this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
				}
			})
			.then(() => {
				return totalRecCountPromise;
			})
			.then(totalRecCount => {
				if (this.currentPage * this.recordsPerPage > totalRecCount - 1) {
					/**  Go to the last page if necessary */
					const lastPage = Math.ceil(totalRecCount / this.recordsPerPage);
					this.currentPage = lastPage;
					this.currentFirstRecordIndex = (lastPage - 1) * this.recordsPerPage;
					return this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
				}
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
				throw Error('Error updating screen:');
			});
	}

	/** Adjust the number of records displayed based on screen height */
	windowAdjustments(screenHeight: number): number {
		const estimatedRowHeightFactor = 1;
		const estimatedRowHeight = estimatedRowHeightFactor * 50;
		const availableScreenHeight = screenHeight - 140;
		const recordsPerPage = Math.floor(availableScreenHeight / estimatedRowHeight);
		/** This ensures that will at least be 1 record on display */
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
		/** Prevent certain keys in the search input */
		$("#searchInput").on("keydown", (e) => {
			if (e.key === "e" || e.key === "E" || e.key === "."
				|| e.key === "+" || e.key === "-") {
				e.preventDefault();
			}
		});

		/** Handle form submission for searching */
		$("#searchForm").submit((e) => {
			e.preventDefault();
			const searchInputValue = $("#searchInput").val() as string;
			const searchValue = Number(searchInputValue);
			$("#tableWrapper").hide();
			$("#loader").show();
			this.searchedIndex = null;
			this.searchMethod(searchValue);
			$("#loader").hide();
			$("#tableWrapper").show();
		});

		/** Handle previous page button click */
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
				.catch((error) => {
					throw error;
				});
		});

		/** Handle next page button click */
		$("#nextPageButton").on("click", () => {
			if ($("#nextPageButton").hasClass("hidden")) {
				return;
			}
			if (this.currentPage >= this.totalPages) {
				const errorMessage = "Already on the last page";
				window.alert(errorMessage);
				throw new Error(errorMessage);
			}
			$("#nextPageButton").addClass("hidden");
			this.searchedIndex = null;
			let fromRecord = this.currentFirstRecordIndex;
			$("#nextPageButton").hide();
			$("#prevPageButton").hide();
			$("#tableWrapper").hide();
			$("#loader").show();
			let totalRecCount: number | void;
			this.totalRecords()
				.then(() => {
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
				.catch((error) => {
					throw error;
				});
		});
	}
}

/** Initialize the app when the page loads */
new InitializeApp();
