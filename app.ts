class DataHandler {
	/** It tracks if the showRecords function is running. Is false if it's not. */
	private isFunctionRunning: boolean;
	/** Provides the url to the server during initialization. */
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
	/** Will cache the record count and only make another api call if needed */
	private recordCount: number;

	constructor() {
		this.isFunctionRunning = false;
		this.apiManager = new ApiManager("http://localhost:2050");
		this.currentPage = 1;
		this.paginationStart = 1;
		this.paginationEnd = 10;
		this.currentFromID = 0;
		this.currentToID = 20;
		this.difference = 0;
		this.resizeTimer = null;
		this.recordCount = 0;
	}

	getRecordCount(): Promise<number> {
		if (this.recordCount !== 0) {
			return Promise.resolve(this.recordCount);
		}
		return this.apiManager.getRecordCount()
			.then(count => {
				this.recordCount = count;
				return this.recordCount;
			})
			.catch(error => {
				console.error("Failed getting the record count: ", error);
				throw error;
			});
	}

	/** Fetching the columns and rendering it on the table in the dom. */
	showColumns(): Promise<void> {
		$(".head-row").empty();
		return this.apiManager.getColumns()
			.then(columns => {
				for (const column of columns) {
					$("#records-table-heading").append(`<th>${column}</th>`);
				}
			})
			.catch(error => {
				console.error("Failed showing the columns: ", error);
				throw error;
			});
	}

	/** Fetching the records and rendering it on the DOM in the table*/
	showRecords(fromID: number, toID: number): Promise<void> {
		if (this.isFunctionRunning) {
			return new Promise<void>(() => { });
		}
		this.isFunctionRunning = true;
		let inputNumber: number;
		let stringCount: string;
		return this.getRecordCount()
			.then(count => {
				inputNumber = this.input();
				const maxRecords = this.recordsPerPage();
				$("#records-table-body").empty();
				this.loader();
				this.currentToID = toID;
				this.currentFromID = fromID;
				if (toID >= count) {
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
				let inputNumberString = inputNumber.toString();
				for (const record of records) {
					$("#records-table-body").append(`<tr class="body-row">`);
					for (const value of record) {
						let isSearchValue = value === inputNumberString;
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
				this.isFunctionRunning = false;
				console.error("Failed showing the records: ", error);
				throw error;
			});
	}

	/** Handles pagination functionality and rendering it on the DOM.*/
	pageNumbers(start: number, end: number): Promise<void> {
		this.paginationStart = start;
		this.paginationEnd = end;
		return this.getRecordCount()
			.then(count => {
				$('.pagination').empty();
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
				if (this.paginationStart <= 1) {
					this.paginationStart = 1;
					$(".prev").css({ display: "none" });
				} else {
					$(".prev").css({ display: "block" });
				}
				for (let i = this.paginationStart; i <= this.paginationEnd; i++) {
					let isActive = i == this.currentPage;
					$(".pagination").append(
						`<a id="page-${i}" value="${i}" class="pagination-item ${isActive ? 'active' : ''}">${i}</a>`
					);
				}
			})
			.catch(error => {
				console.error("Failed when showing the page numbers: ", error);
				throw error;
			});
	}

	/** Handles all the functionality related to pagination. */
	initializePagination(): void {
		// Render the specific amount of records to the DOM based on the current page that it gets from the 
		// element's attribute value. 
		$(".pagination").on("click", ".pagination-item", (event) => {
			$('.pagination-item').prop('disabled', true);
			$('.search-input').val('');
			let returnedId = <string>($(event.target).attr("value"));
			let maxRecords = this.recordsPerPage();
			this.currentPage = parseInt(returnedId);
			let toID = this.currentPage * (maxRecords + 1) - 1;
			if (this.difference > 0) {
				toID = toID - this.difference;
			}
			let fromID = toID - maxRecords;
			this.currentFromID = fromID;
			$(".pagination-item").removeClass("active");
			$(event.target).addClass("active");
			$(".pagination-item").each(() => {
				let elementID = <string>($(this).attr('value'));
				let currentPageString = this.currentPage.toString();
				if (elementID == currentPageString) {
					$(this).addClass('active');
				}
			});
			this.showRecords(fromID, toID)
				.then(() => {
					$('.pagination-item').prop('disabled', false);
				})
				.catch(error => {
					console.error("Failed when clicking on the pagination: ", error);
					alert("An error occurred while trying to load the page. Please try again.");
				});
		});

		// Gives the next set of page numbers based on the last page on the pagination.
		$(".next").on("click", () => {
			this.paginationStart = this.paginationEnd + 1;
			this.paginationEnd = this.paginationStart + 9;
			this.pageNumbers(this.paginationStart, this.paginationEnd)
				.catch(error => {
					console.error("Failed when clicking on the next button: ", error);
					alert("An error occurred while trying to load the next set of pages. Please try again.");
				});
		});

		// Gives the previous set of pages numbers based on the last page in the pagination
		$(".prev").on("click", () => {
			this.paginationEnd = this.paginationStart - 1;
			this.paginationStart = this.paginationEnd - 9;
			this.pageNumbers(this.paginationStart, this.paginationEnd)
				.catch(error => {
					console.error("Failed when clicking on the previous button: ", error);
					alert("An error occurred while trying to load the previous set of pages. Please try again.");
				});
		});
	}

	/** Handles all the functionality related to the search. */
	initializeSearch(): void {
		let regexPattern = /[0-9]/;
		// Prevents certain characters to be entered in the input field.
		$('.search-input').on('keydown', (e) => {
			if (!regexPattern.test(e.key) && e.key.length === 1) {
				e.preventDefault();
			}
			if (e.key === 'Enter') {
				$('.heading').trigger('click', '.results-box');
			}
		});

		// Takes the number entered in the search field and calculates a range and render that 
		// on to the DOM.
		$(".search-input").on("input", (e: any) => {
			e.preventDefault();
			this.getRecordCount()
				.then(count => {
					let inputNumber = this.input();
					if (!regexPattern.test(e.key)) {
						let maxRecords = this.recordsPerPage();
						let pageNumber = Math.ceil(inputNumber / (maxRecords + 1));
						let end = pageNumber * (maxRecords + 1) - 1;
						let start = end - maxRecords;
						if (start < 0 || start < maxRecords) {
							start = 0;
							end = start + maxRecords;
						}
						if (end >= count) {
							end = (count - 1);
							this.currentToID = end;
						}
						this.currentPage = Math.floor((end + 1) / (maxRecords + 1));
						if (inputNumber < count && inputNumber > -1) {
							$('.results-box').remove();
							$('.search-container').append(
								`<div class="results-box">
									<p class="results-select">${start} - ${end}</p>
								</div>`);
						} else {
							$('.results-box').remove();
							$('.search-container').append(
								`<div class="results-box">
									<p class="message">Invalid Input!</p>
								</div>`);
						}
					} else {
						$('.results-box').remove();
					}
				})
				.catch(error => {
					console.error("Failed when searching: ", error);
					alert("An error occurred while trying to search. Please try again.");
				});
		});

		// Will take the range on the DOM and return records based on that range.
		$('.heading').on('click', '.results-select', (event: any) => {
			$('.results-select').prop('disabled', true);
			let startID: number;
			let endID: number;
			let pageEnd: number;
			let pageStart: number;
			this.getRecordCount()
				.then(count => {
					let idRange = $('.results-select').text();
					let rangeArray = null;
					rangeArray = idRange.split('-');
					$('.results-box').remove();
					startID = parseInt(rangeArray[0]);
					endID = parseInt(rangeArray[1]);
					if (!isNaN(endID) && Number.isInteger(endID)) {
						let maxRecords = this.recordsPerPage();
						this.currentPage = Math.floor((endID + 1) / (maxRecords + 1));
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
					this.pageNumbers(pageStart, pageEnd);
				})
				.then(() => {
					this.showRecords(startID, endID);
				})
				.then(() => {
					$('.results-select').prop('disabled', false);
				})
				.catch(error => {
					console.error("Failed when clicking on the results: ", error);
					alert("An error occurred while trying to search. Please try again.");
				});
		});
	}

	/** Will calculate the amount records to be shown according to the screen height. */
	adjustDisplayedRecords(): Promise<void> {
		let pageStart: number;
		let pageEnd: number;
		return this.getRecordCount()
			.then(count => {
				let maxRecords = this.recordsPerPage();
				let inputNumber = this.input();
				let newToID = this.currentToID === 0 ? this.currentToID + 1 : this.currentToID;
				let newMaxRecords = maxRecords === 0 ? maxRecords + 1 : maxRecords;
				if (inputNumber === -1) {
					let newCurrentPage = Math.ceil(this.currentFromID / newMaxRecords);
					if (newCurrentPage === 0) {
						this.currentFromID = 0;
						newCurrentPage = 1;
					}
					this.currentToID = this.currentFromID + maxRecords;
					this.currentPage = newCurrentPage;
					let originalID = (this.currentPage - 1) * (maxRecords + 1);
					this.difference = originalID - this.currentFromID;
				} else {
					if (this.currentToID >= count) {
						this.currentToID = (count - 1);
					}
					let newCurrentPage = Math.ceil(inputNumber / maxRecords);
					this.currentToID = newCurrentPage * maxRecords;
					this.currentPage = newCurrentPage;
					this.currentFromID = (this.currentPage - 1) * maxRecords + 1;
				}
				pageEnd = Math.ceil(Math.floor(newToID / newMaxRecords) / 10) * 10;
				pageEnd = pageEnd === 0 ? 10 : pageEnd;
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
				console.error("Failed when adjusting the window size: ", error);
				throw error;
			});
	}

	/** When resizing the window. Timeout is put in place so that the function doesn't
	 * take in every value returned during resizing. */
	resize(): void {
		if (this.resizeTimer !== null) {
			clearTimeout(this.resizeTimer);
		}
		this.resizeTimer = setTimeout(() => {
			this.adjustDisplayedRecords()
				.catch(error => {
					console.log("Failed when resizing the window: ", error);
					alert("An error occurred while trying to resize the window. Please try again.");
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
		return maxRecords;
	}

	/** Retrieve the search value from the input even when it's empty. */
	input(): number {
		let inputValue = <string>($('.search-input').val());
		let inputNumber = parseInt(inputValue);
		if (isNaN(inputNumber) || inputNumber < 0) {
			return -1;
		} else {
			return inputNumber;
		}
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
			console.error("Failed when loading the page: ", error);
			alert("An error occurred while trying to load your page. Please try again.");
		});
	$(window).on('resize', () => {
		dataHandler.resize();
	});
}
