class DataHandler {
	/** It tracks if the showRecords function is running and would the value would be false if it's not. */
	private isFunctionRunning: boolean;
	/** This is an instance of the ApiManager class and passing a string when being used. */
	private apiManager: ApiManager;
	/** The following track what page the user is on when navigating through the web app. */
	private currentPage: number;
	/** This tracks the first page of the pagination that is being displayed. */
	private paginationStart: number;
	/** This will track the last page that is being displayed. */
	private paginationEnd: number;
	/** Tracks the current starting ID in the table. */
	private currentFromID: number;
	/** Track the current last ID in the table. */
	private currentToID: number;
	/** This is the calculation for the difference between the original ID  based on the currentPage
	 * and the currentID which is based on the resizing of the table. */
	private difference: number;
	/** A timer that handles window resizing events and store the return type of setTimeout. */
	private resizeTimer: ReturnType<typeof setTimeout> | null;

	constructor() {
		this.isFunctionRunning = false;
		this.apiManager = new ApiManager("http://localhost:2050/");
		this.currentPage = 1;
		this.paginationStart = 1;
		this.paginationEnd = 10;
		this.currentFromID = 0;
		this.currentToID = 20;
		this.difference = 0;
		this.resizeTimer = null;
	}

	/** Returning columns and rendering it on the table in the dom. */
	showColumns(): Promise<void> {
		$(".head-row").empty();
		return this.apiManager.getColumns()
			.then(columns => {
				for (const column of columns) {
					$("#records-table-heading").append(`<th>${column}</th>`);
				}
			})
			.catch(error => {
				throw new Error(`Failed to retrieve columns: ${error}`);
			});
	}

	/** Fetching the records and rendering it on the DOM in the table*/
	showRecords(fromID: number, toID: number): Promise<any> {
		if (this.isFunctionRunning) {
			return Promise.resolve(undefined);
		}
		this.isFunctionRunning = true;
		let inputNumber: string;
		let stringCount: string;
		return this.apiManager.getRecordCount()
			.then(count => {
				inputNumber = this.input();
				const maxRecords = this.recordsPerPage();
				$("#records-table-body").empty();
				this.loader();
				this.currentToID = toID;
				this.currentFromID = fromID;
				if (toID >= (count - 1)) {
					this.currentToID = (count - 1);
					this.currentFromID = this.currentToID - (maxRecords - 1);
				} else if (this.currentPage === 1) {
					this.currentFromID = 0;
				}
				stringCount = count.toLocaleString().replace(/,/g, " ");
				return this.apiManager.getRecords(this.currentFromID, this.currentToID);
			})
			.then(records => {
				$('.results').empty().append(`Displaying ID's ${this.currentFromID} - ${this.currentToID} out of ${stringCount}`);
				for (const record of records) {
					$("#records-table-body").append(`<tr class="body-row">`);
					for (const value of record) {
						let isSearchValue = value === inputNumber;
						$(".body-row:last-child").append(
							`<td>
								<span class="${isSearchValue ? 'highlight' : ''}">${value}</span>
							</td>`);
					}
					$("#records-table-body").append(`</tr>`);
				}
				this.isFunctionRunning = false;
			})
			.catch(error => {
				alert("Something went wrong. Click on the button to refresh the page.");
				location.reload();
				this.isFunctionRunning = false;
			});
	}

	/** Handles pagination functionality and rendering it on the DOM.*/
	pageNumbers(start: number, end: number): Promise<void> {
		this.paginationStart = start;
		this.paginationEnd = end;
		return this.apiManager.getRecordCount()
			.then(count => {
				$('.pagination').empty();
				let stringCount = count.toLocaleString().replace(/,/g, " ");
				let maxRecords = this.recordsPerPage();
				// This is the last page of all the records. It's calculated based on the amount of records showed
				// on the table and the count of the records.
				let lastPage = Math.ceil((count - 1) / maxRecords);
				if (lastPage <= this.paginationEnd && lastPage >= this.paginationStart) {
					this.paginationEnd = lastPage;
					$(".next").css({ display: "none" });
				} else {
					$(".next").css({ display: "block" });
				}
				if (this.paginationStart < 1) {
					this.paginationStart = 1;
				}
				for (let i = this.paginationStart; i <= this.paginationEnd; i++) {
					let isActive = i == this.currentPage;
					$(".pagination").append(
						`<a id="page-${i}" value="${i}" class="pagination-item ${isActive ? 'active' : ''}">${i}</a>`
					);
				}
				if (this.paginationStart === 1) {
					$(".prev").css({ display: "none" });
				} else {
					$(".prev").css({ display: "block" });
				}
			})
			.catch(error => {
				throw new Error(`Failed rendering the pagination: ${error}`);
			});
	}

	/** Handles all the functionality related to pagination. */
	initializePagination(): void {
		// Render the specific amount of records to the DOM based on the current page that it gets from the 
		// element's attribute value. 
		$(".pagination").on("click", ".pagination-item", (event) => {
			$('.pagination-item').prop('disabled', true);
			return this.apiManager.getRecordCount()
				.then(count => {
					$('.search-input').val('');
					let returnedId = <string>($(event.target).attr("value"));
					this.currentPage = parseInt(returnedId);
					const maxRecords = this.recordsPerPage();
					let fromID = Math.ceil(this.currentPage * maxRecords - (maxRecords - 1));
					if (this.difference > 0 && this.difference < maxRecords) {
						fromID = fromID + this.difference;
					}
					let toID = fromID + (maxRecords - 1);
					if (fromID > count + 1 || toID > count + 1) {
						toID = count;
						fromID = toID - maxRecords;
						this.currentFromID = fromID;
					}
					this.currentFromID = fromID;
					$(".pagination-item").removeClass("active");
					$(event.target).addClass("active");
					const self = this;
					$(".pagination-item").each(function () {
						let elementID = <string>($(this).attr('value'));
						let currentPageString = self.currentPage.toString();
						if (elementID == currentPageString) {
							$(this).addClass('active');
						}
					});
					return this.showRecords(fromID, toID)
						.then(() => {
							$('.pagination-item').prop('disabled', false)
						});
				})
				.catch(error => {
					throw new Error(`Failed showing the records when clicking on the page button: ${error}`);
				});
		})

		/** Gives the next set of page numbers based on the last page on the pagination. */
		$(".next").on("click", () => {
			this.paginationStart = this.paginationEnd + 1;
			this.paginationEnd = this.paginationStart + 9;
			$(".pagination").empty();
			this.pageNumbers(this.paginationStart, this.paginationEnd);
		});

		/** Gives the previous set of pages numbers based on the last page in the pagination. */
		$(".prev").on("click", () => {
			this.paginationEnd = this.paginationStart - 1;
			this.paginationStart = this.paginationEnd - 9;
			$(".pagination").empty();
			this.pageNumbers(this.paginationStart, this.paginationEnd);
		});
	}

	/** Handles all the functionality related to the search. */
	initializeSearch(): void {
		/** Prevents certain characters to be entered in the input field. */
		$('.search-input').on('keydown', (e) => {
			if (e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+' || e.key === '*' || e.key === '-') {
				e.preventDefault();
			}
			if (e.key === 'Enter') {
				$('.heading').trigger('click', '.results-box');
			}
		});

		/** Takes the number entered in the search field and calculates a range and render that 
		 * on to the DOM. */
		$(".search-input").on("input", (event: any) => {
			event.preventDefault();
			return this.apiManager.getRecordCount()
				.then(count => {
					let inputNumber = this.input();
					let inputNumberInt = parseInt(inputNumber);
					if (inputNumber !== '') {
						const maxRecords = this.recordsPerPage();
						let end = Math.ceil(inputNumberInt / maxRecords) * (maxRecords);
						if (end > (count + 1)) {
							end = count;
							this.currentToID = end;
						}
						let start = (end - (maxRecords - 1));
						if ((end - maxRecords) === 0) {
							end = Math.ceil(inputNumberInt / maxRecords) * (maxRecords);
							start = end - maxRecords;
						}
						this.currentPage = Math.floor(end / maxRecords);
						if (inputNumberInt < 1000000 && inputNumberInt > 0) {
							if (end === 1000000) {
								end = end - 1;
							} else {
								null;
							}
							$('.results-box').remove();
							$('.search-container').append(`
							<div class="results-box">
								<p class="results-select">${start} - ${end}</p>
							</div>`);
						} else {
							$('.results-box').remove();
							$('.search-container').append(`
							<div class="results-box">
								<p class="message">Invalid Input!</p>
							</div>`);
						}
					} else {
						$('.results-box').remove();
					}
				})
				.catch(error => {
					throw new Error(`Failed when attempting to search: ${error}`);
				});
		});

		/** Will take the range on the DOM and return records based on that range. */
		$('.heading').on('click', '.results-select', (event: any) => {
			$('.results-select').prop('disabled', true);
			let startID: number;
			let endID: number;
			let pageEnd: number;
			let pageStart: number;
			return this.apiManager.getRecordCount()
				.then(count => {
					let idRange = $('.results-select').text();
					let rangeArray = null;
					rangeArray = idRange.split('-');
					$('.results-box').remove();
					startID = parseInt(rangeArray[0]);
					endID = parseInt(rangeArray[1]);
					if (!isNaN(endID) && Number.isInteger(endID)) {
						let maxRecords = this.recordsPerPage();
						this.currentPage = Math.ceil(endID / maxRecords);
						pageEnd = Math.ceil(this.currentPage / 10) * 10;
						pageStart = pageEnd - 9;
						if (endID >= count) {
							startID = ((this.currentPage - 1) * maxRecords) + 1;
							endID = (count - 1);
							this.paginationStart = pageStart;
							this.paginationEnd = pageEnd;
						}
					} else {
						throw new Error("Please provide a valid integer.");
					}
				})
				.then(() => {
					return this.pageNumbers(pageStart, pageEnd);
				})
				.then(() => {
					return this.showRecords(startID, endID);
				})
				.then(() => {
					$('.results-select').prop('disabled', false);
				})
				.catch(error => {
					throw new Error(`Failed when clicking on the search range: ${error}`);
				});
		});
	}

	/** Will calculate the amount records to be shown according to the screen height. */
	adjustDisplayedRecords(): Promise<void> {
		let screenHeight = <number>($('#records-table-body').height());
		let pageStart: number;
		let pageEnd: number;
		return this.apiManager.getRecordCount()
			.then(count => {
				let maxRecords = Math.ceil(screenHeight / 68);
				maxRecords = maxRecords - 1;
				let inputNumber = this.input();
				let length = inputNumber.length;
				let inputNumberInt = parseInt(inputNumber);
				if (inputNumber === '') {
					if (this.currentFromID === 0) {
						this.currentFromID = 0;
					}
					let newCurrentPage = Math.ceil(this.currentFromID / maxRecords);
					if (newCurrentPage === 1) {
						newCurrentPage = 1;
						this.currentFromID = 0;
					}
					this.currentToID = this.currentFromID + maxRecords;
					this.currentPage = newCurrentPage;
					let originalID = (Math.floor(maxRecords * this.currentPage) - (maxRecords - 1));
					this.difference = this.currentFromID - originalID;
				} else {
					if (this.currentToID >= count) {
						this.currentToID = (count - 1);
					}
					if (length > 0) {
						let newCurrentPage = Math.ceil(inputNumberInt / maxRecords);
						this.currentToID = newCurrentPage * maxRecords;
						this.currentPage = newCurrentPage;
						this.currentFromID = (this.currentPage - 1) * maxRecords + 1;
					}
				}
				if (this.currentFromID === 0) {
					pageEnd = Math.ceil(Math.floor(this.currentToID / (maxRecords - 1)) / 10) * 10;
					if (screenHeight < 136) {
						pageEnd = Math.ceil(Math.floor(this.currentToID / (maxRecords)) / 10) * 10;
					}
				} else {
					pageEnd = Math.ceil(Math.floor(this.currentToID / (maxRecords)) / 10) * 10;
				}
				pageStart = pageEnd - 9;
				this.paginationStart = pageStart;
				this.paginationEnd = pageEnd;
				$("#records-table-body").empty();
				return this.showRecords(this.currentFromID, this.currentToID);
			})
			.then(() => {
				return this.pageNumbers(pageStart, pageEnd);
			})
			.catch(error => {
				throw new Error(`Failed when resizing the window: ${error}`);
			});
	}

	/** When resizing the window. Timeout is put in place so that the function doesn't
	 * take in every value returned when resizing. */
	resize(): void {
		if (this.resizeTimer !== null) {
			clearTimeout(this.resizeTimer);
		}
		this.resizeTimer = setTimeout(() => {
			return this.adjustDisplayedRecords()
				.catch(error => {
					throw error;
				});
		}, 250);
	}

	/** Will display when the table is empty and it's busy fetching the records. */
	loader(): void {
		let content = $('#records-table-body').text();
		if (content === '') {
			$('.results').append('<div class="loader"></div>');
		} else {
			$('.loader').css({ 'display': 'none' });
		}
	}

	/** Calculate how many records should be displayed according to the screen height. */
	recordsPerPage(): number {
		const screenHeight = <number>($('#records-table-body').height());
		let maxRecords = Math.floor(screenHeight / 68);
		maxRecords = maxRecords - 1;
		return maxRecords;
	}

	/** Retrieve the search value from the input even when it's empty. */
	input(): string {
		let inputNumber = <string>($('.search-input').val());
		return inputNumber;
	}
}

/** Runs when the web app is started. */
window.onload = () => {
	const dataHandler = new DataHandler();
	dataHandler.showColumns()
		.then(() => {
			dataHandler.adjustDisplayedRecords();
		})
		.then(() => {
			dataHandler.initializePagination();
			dataHandler.initializeSearch();
		})
		.catch(error => {
			throw new Error(`An error occurred when loading your page: ${error}`);
		});
	$(window).on('resize', () => {
		dataHandler.resize();
	});
}
