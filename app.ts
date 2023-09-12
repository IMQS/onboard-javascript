class InitializeApp {
	IMQS: string = "http://localhost:2050";
	currentValueOfFirstRecord: number = 1;
	currentFirstRecordIndex: number = 0;
	currentPage: number = 1;
	totalPages: number = 1;
	recordsPerPage: number = 16;
	searchedIndex: number | null = null;
	isButtonDisabled: boolean = false;

	constructor() {
		this.fetchColumns();
		this.inputHandling();
		this.updateScreen();
		window.onload = () => {
			$("#loader").hide();
			$(window).on("resize", this.debounce(() => {
				this.updateScreen()
					.then(() => {
						$("#loader").hide();
						$("#tableWrapper").show();
					})
					.catch(error => {
						throw error('Error trying to resize the page:');
					});
			}, 250));

			$("#searchInput").on("keydown", (e) => {
				if (e.key === "e" || e.key === "E" || e.key === "."
					|| e.key === "+" || e.key === "-") {
					e.preventDefault();
				}
			});

			$("#searchForm").submit((e) => {
				e.preventDefault();
				const searchInput = document.getElementById("searchInput") as HTMLInputElement;
				const searchValue = Number(searchInput.value);
				$("#tableWrapper").hide();
				$("#loader").show();
				this.searchedIndex = null;
				this.searchMethod(searchValue)
					.then(() => {
						if (this.searchedIndex !== null) {
							this.currentPage = Math.ceil((this.searchedIndex + 1) / this.recordsPerPage);
							this.currentFirstRecordIndex = Math.max(this.searchedIndex - this.recordsPerPage + 1, 0);
						};
					})
					.catch(error => {
						throw error('Error with searching function');
					});
				$("#loader").hide();
				$("#tableWrapper").show();
			});

			$("#prevPageButton").on("click", async () => {
				if ($("#prevPageButton").hasClass("hidden")) {
					return;
				}
				if (this.currentPage <= 1) {
					throw new Error("Already on the first page");
				}
				$("#prevPageButton").addClass("hidden");
				this.searchedIndex = null;
				const firstRecordOfCurrentPage = (this.currentPage - 1) * this.recordsPerPage;
				if (firstRecordOfCurrentPage <= this.recordsPerPage) {
					this.currentPage = 1;
					this.currentFirstRecordIndex = 0;
				} else {
					this.currentPage--;
					this.currentFirstRecordIndex -= this.recordsPerPage;
				}
				const fromRecord = this.currentFirstRecordIndex;
				$("#nextPageButton").hide();
				$("#prevPageButton").hide();
				$("#tableWrapper").hide();
				$("#loader").show();
				this.displayData(fromRecord, this.recordsPerPage)
					.then(() => {
						$("#nextPageButton").show();
						$("#prevPageButton").show();
						$("#prevPageButton").removeClass("hidden");
						$("#loader").hide();
						$("#tableWrapper").show();
						if (this.currentFirstRecordIndex <= 0) {
							$("#prevPageButton").hide();
						} else if (this.currentPage < this.totalPages) {
							$("#nextPageButton").show();
						}
					})
					.catch(error => {
						throw error;
					});
			});

			$("#nextPageButton").on("click", async () => {
				if ($("#nextPageButton").hasClass("hidden")) {
					return;
				}
				if (this.currentPage >= this.totalPages) {
					throw new Error("Already on the last page");
				}
				$("#nextPageButton").addClass("hidden");
				this.searchedIndex = null;
				const totalRecCount = await this.totalRecords();
				if (this.currentPage < this.totalPages) {
					this.currentPage++;
					this.currentFirstRecordIndex += this.recordsPerPage;
				} else {
					this.currentPage = this.totalPages;
				}
				let fromRecord = this.currentFirstRecordIndex;
				$("#nextPageButton").hide();
				$("#prevPageButton").hide();
				$("#tableWrapper").hide();
				$("#loader").show();
				this.displayData(fromRecord, this.recordsPerPage)
					.then(() => {
						$("#nextPageButton").show();
						$("#prevPageButton").show();
						$("#nextPageButton").removeClass("hidden");
						$("#loader").hide();
						$("#tableWrapper").show();
						if (this.currentFirstRecordIndex >= totalRecCount) {
							$("#nextPageButton").hide();
						}
					})
					.catch(error => {
						throw error;
					});
			});
		}
	}

	totalRecords(): Promise<number> {
		return fetch(`${this.IMQS}/recordCount`)
			.then((recordCountResponse) => {
				if (!recordCountResponse.ok) {
					throw new Error('Network response was not ok');
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

	fetchColumns(): Promise<string[]> {
		return fetch(`${this.IMQS}/columns`)
			.then((columnsResponse) => {
				if (!columnsResponse.ok) {
					throw new Error('Network response was not ok');
				}
				return columnsResponse.json();
			})
			.then((columns: string[]) => {
				const tableHeaderRow = $("#tableHeaderRow");
				for (const columnName of columns) {
					const th = document.createElement("th");
					th.textContent = columnName;
					tableHeaderRow.append(th);
				}
				return columns;
			})
			.catch((error) => {
				throw error;
			});
	}

	fetchRecords(fromRecord: number, toRecord: number): Promise<any> {
		if (fromRecord > toRecord) {
			throw new Error('Invalid arguments: fromRecord cannot be greater than toRecord');
		}
		return fetch(`${this.IMQS}/records?from=${fromRecord}&to=${toRecord}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.catch((error) => {
				throw error;
			});
	}

	windowAdjustments(screenHeight: number): number {
		const estimatedRowHeightFactor = 1;
		const estimatedRowHeight = estimatedRowHeightFactor * 50;
		const availableScreenHeight = screenHeight - 150;
		const recordsPerPage = Math.floor(availableScreenHeight / estimatedRowHeight);
		// Ensure a minimum of 1 record per page.
		return Math.max(recordsPerPage, 1);
	}

	inputHandling(): Promise<void> {
		return this.totalRecords()
			.then(totalRecCount => {
				const searchInput = document.getElementById("searchInput") as HTMLInputElement;
				searchInput.min = "0";
				searchInput.max = (totalRecCount - 1).toString();
			});
	}

	debounce(func: any, delay: number) {
		let timeoutId: any;
		return function (...args: any) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func(...args);
			}, delay);
		};
	}

	async displayData(fromRecord: number, recordsDisplayed: number): Promise<any> {
		$("#loader").show();
		$("#tableWrapper").hide();
		const adjustedFromRecord = Math.max(fromRecord, 0);
		const recordCount = await this.totalRecords();
		this.totalPages = Math.ceil(recordCount / this.recordsPerPage);
		if (this.currentPage * this.recordsPerPage > recordCount) {
			throw new Error('Requested records exceed the total record count');
		}
		const maximumRecords = Math.min(recordCount - adjustedFromRecord, recordsDisplayed);
		const toRecord = adjustedFromRecord + maximumRecords - 1;
		const data = await this.fetchRecords(adjustedFromRecord, toRecord);
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
	}

	async searchMethod(searchValue: number): Promise<void> {
		const totalRecCount = await this.totalRecords();
		searchValue = Math.min(searchValue, totalRecCount - 1);
		const lastRecordIndex = totalRecCount - 1;
		const searchIndex = Math.min(searchValue, lastRecordIndex);
		const targetPage = Math.ceil((searchIndex + 1) / this.recordsPerPage);
		const fromRecord = Math.max(searchIndex - (this.recordsPerPage - 1), 0);
		const toRecord = Math.min(fromRecord + this.recordsPerPage - 1, lastRecordIndex);
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
				}
				return Promise.resolve();
			})
			.then(() => {
				$("#loader").hide();
				$("#tableWrapper").show();
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
	}

	async updateScreen(): Promise<void> {
		const newScreenHeight = window.innerHeight;
		this.recordsPerPage = this.windowAdjustments(newScreenHeight);
		$("#loader").show();
		$("#tableWrapper").hide();
		if (this.searchedIndex !== null) {
			const searchPageIndex = this.searchedIndex % this.recordsPerPage;
			const firstRecordOfCurrentPage = (this.currentPage - 1) * this.recordsPerPage;
			if (searchPageIndex >= firstRecordOfCurrentPage && searchPageIndex < firstRecordOfCurrentPage + this.recordsPerPage) {
				this.displayData(firstRecordOfCurrentPage, this.recordsPerPage);
			} else {
				this.currentPage = Math.ceil((this.searchedIndex + 1) / this.recordsPerPage);
				this.currentFirstRecordIndex = Math.max(this.searchedIndex - this.recordsPerPage + 1, 0);
				this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
			}
		} else {
			const previousFirstRecordIndex = this.currentFirstRecordIndex;
			this.currentPage = Math.ceil((this.currentFirstRecordIndex + 1) / this.recordsPerPage);
			this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
		}
		const totalRecCount = await this.totalRecords();
		if (this.currentPage * this.recordsPerPage > totalRecCount - 1) {
			// Go to the last page if necessary
			const lastPage = Math.ceil(totalRecCount / this.recordsPerPage);
			this.currentPage = lastPage;
			this.currentFirstRecordIndex = (lastPage - 1) * this.recordsPerPage;
			this.displayData(this.currentFirstRecordIndex, this.recordsPerPage);
		}
		$("#loader").hide();
		$("#tableWrapper").show();
		if (this.currentPage === this.totalPages) {
			$("#nextPageButton").hide();
		} else {
			$("#nextPageButton").show();
		}
		if (this.currentFirstRecordIndex <= 0) {
			$("#prevPageButton").hide();
		} else {
			$("#prevPageButton").show();
		}
	}
}

new InitializeApp();
