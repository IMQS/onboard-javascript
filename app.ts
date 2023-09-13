class DataHandler {
	/** It tracks if the showRecords function is running and would the value would be false if it's not. */
	private isFunctionRunning: boolean;
	/** This is an instance of the ApiManager class and passing a string when being used. */
	private apiManager: ApiManager;
	/** The following track what page the user is on when navigating through the web app. */
	private currentPage: number;
	/** This tracks the first page of the pagination that is being displayed. */
	private firstPage: number;
	/** This will track the last page that is being displayed. */
	private lastPage: number;
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
		this.firstPage = 1;
		this.lastPage = 10;
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
					$("thead").append(`<th>${column}</th>`);
				}
			})
			.catch(error => {
				throw new Error(`Failed to retrieve columns: ${error}`)
			});
	}

	// This function will loop through and display the records on the table.
	showRecords(fromID: number, toID: number): Promise<void> {
		if (this.isFunctionRunning) {
			return Promise.resolve(undefined);;
		}
		this.isFunctionRunning = true;
		let condition: number;
		let inputNumber: string;
		let stringCount: string;
		return this.apiManager.getRecordCount()
			.then(count => {
				inputNumber = this.input();
				const maxRecords = this.recordsPerPage();
				condition = Math.ceil(count / maxRecords);
				$("tbody").empty();
				this.loader();
				if (toID >= count) {
					toID = count;
					fromID = toID - (maxRecords - 1);
				} else if (this.currentPage === 1) {
					fromID = 0;
				};
				this.currentToID = toID;
				stringCount = count.toLocaleString().replace(/,/g, " ");
				return this.apiManager.getRecords(fromID, toID);
			})
			.then(records => {
				$('.results').empty().append(`Displaying ID's ${fromID} - ${toID} out of ${stringCount}`);
				for (let i = 0; i < records.length; i++) {
					$("tbody").append(`<tr class="body-row">`);
					for (let n = 0; n < records[i].length; n++) {
						$(".body-row:last-child").append(`<td><span>${records[i][n]}</span></td>`);
					}
					$("tbody").append(`</tr>`);
				};

				$("span").each(function () {
					const lowercasedID = $(this).text();
					if (lowercasedID == inputNumber) {
						$(this).css({ "background-color": "#FFFF00", "color": "black  " });
					} else {
						$(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
					}
				});

				if (condition >= fromID && condition <= toID) {
					$(".next").css({ display: "none" });
				}
				this.isFunctionRunning = false;
			})
			.catch(error => {
				throw new Error(`Failed to retrieve the records: ${error}`);
			})
	}

	// The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
	pageNumbers(start: number, end: number): Promise<void> {
		return this.apiManager.getRecordCount()
			.then(count => {
				$('.pagination').empty();
				let stringCount = count.toLocaleString().replace(/,/g, " ");
				let maxRecords = this.recordsPerPage();
				let condition = Math.floor(count / maxRecords) + 1;
				if (condition <= end && condition >= start) {
					if (999999 % maxRecords === 0) {
						end = (condition - 1);
					} else {
						end = condition;
					}
					$(".next").css({ display: "none" });
				} else {
					$(".next").css({ display: "block" });
				}
				if (start < 1) {
					start = 1;
				}
				this.firstPage = start;
				this.lastPage = end;
				for (let i = start; i <= end; i++) {
					let isActive = i == this.currentPage;
					$(".pagination").append(
						`<a id="${i}" class="pagination-item ${isActive ? 'active' : ''}">${i}</a>`
					);
				}
				if (this.firstPage === 1) {
					$(".prev").css({ display: "none" });
				} else {
					$(".prev").css({ display: "block" });
				}
			})
			.catch(error => {
				throw new Error(`Failed `)
			})
	}


	initializePagination() {
		// Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.
		$(".pagination").on("click", ".pagination-item", (event) => {
			$('.pagination-item').prop('disabled', true);
			return this.apiManager.getRecordCount()
				.then(count => {
					$('.search-input').val('');
					this.currentPage = parseInt($(event.target).attr("id") as any);
					console.log("$(this):", $(event.target))
					const maxRecords = this.recordsPerPage();
					let fromID = Math.ceil(this.currentPage * maxRecords - (maxRecords));
					if (this.difference > 0 && this.difference < maxRecords) {
						fromID = fromID + this.difference;
					}
					if (this.currentPage === 1) {
						this.currentFromID = 1;
					}
					let toID = fromID + (maxRecords);
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
						let elementID = $(this).attr('id') as string;
						let currentPageString = self.currentPage.toString();
						if (elementID == currentPageString) {
							$(this).addClass('active');
						}
					});

					return this.showRecords(fromID, toID)
						.then(() => {
							$('.pagination-item').prop('disabled', false)
						})
				})
				.catch(error => {
					throw new Error(`Failed showing the records when clicking on page number: ${error}`);
				});
		})
		// Adding a click event to the next button of the pagination.
		$(".next").on("click", () => {
			this.firstPage = this.lastPage + 1;
			this.lastPage = this.firstPage + 9;
			$(".pagination").empty();
			this.pageNumbers(this.firstPage, this.lastPage);
		});

		// Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
		$(".prev").on("click", () => {
			this.lastPage = this.firstPage - 1;
			this.firstPage = this.lastPage - 9;
			$(".pagination").empty();
			this.pageNumbers(this.firstPage, this.lastPage);
		});
	}

	initializeSearch() {
		// Event listener to prevent some characters to be entered in the input
		$('.search-input').on('keydown', (e) => {
			if (e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === '+' || e.key === '*' || e.key === '-') {
				e.preventDefault();
			}
			if (e.key === 'Enter') {
				$('.heading').trigger('click', '.results-box');
			}
		});

		// In this function wil do the extract the number entered in the search. Then it would take that and calculate the range which should be displayed for the user to click on. 
		$(".search-input").on("input", (event: any) => {
			event.preventDefault();
			return this.apiManager.getRecordCount()
				.then((count) => {
					let inputNumber = this.input();
					let inputNumberInt: any = parseInt(inputNumber);
					if (inputNumber !== '') {
						const maxRecords = this.recordsPerPage();
						let end = Math.ceil(inputNumberInt / maxRecords) * maxRecords;
						if (end > (count + 1)) {
							end = count;
							this.currentToID = end;
						}
						let start = (end - (maxRecords));
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
				.catch((error) => {
					throw error;
				})
		});
		// After the range has been returned to the user. The user can click on it and that will show the range of records on the table. 
		$('.heading').on('click', '.results-select', (event: any) => {
			$('.results-select').prop('disabled', true);
			let startID: number;
			let endID: number;
			let pageEnd: number;
			let pageStart: number;
			return this.apiManager.getRecordCount()
				.then((count) => {
					let idRange = $('.results-select').text();
					let rangeArray = null;
					rangeArray = idRange.split('-');
					$('.results-box').remove();
					startID = parseInt(rangeArray[0]);
					endID = parseInt(rangeArray[1]);
					let maxRecords = this.recordsPerPage();
					this.currentPage = Math.ceil(endID / maxRecords);
					pageEnd = Math.ceil(this.currentPage / 10) * 10;
					pageStart = pageEnd - 9;
					if (endID === count) {
						startID = ((this.currentPage - 1) * maxRecords) + 1;
						endID = count;
						this.firstPage = pageStart;
						this.lastPage = pageEnd;
					}
				})
				.then(() => {
					return this.pageNumbers(pageStart, pageEnd);
				})
				.then(() => {
					return this.showRecords(startID, endID);
				})
				.then(() => {
					$('.results-select').prop('disabled', false)
				})
				.catch((error) => {
					throw error;
				})
		})
	}

	// When adjusting the height and on different screen sizes. This function would responsible for calculating how much records should be displayed based on the height of the window itself. 
	adjustDisplayedRecords() {
		// if (this.isFunctionRunning) {
		// 	return;
		// }
		// this.isFunctionRunning = true;
		let screenHeight = $(window).height() as number;
		if (screenHeight < 68) {
			screenHeight = 68;
		}
		let maxRecords: number;
		let pageStart: number;
		let pageEnd: number;
		return this.apiManager.getRecordCount()
			.then((count) => {
				let maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
				let inputNumber = this.input();
				let length = inputNumber.length as number;
				let inputNumberInt = parseInt(inputNumber);
				if (inputNumber === '') {
					if(this.currentFromID === 0) {
						this.currentFromID = 1;
					}
					let newCurrentPage = Math.ceil(this.currentFromID / maxRecords);
					if (newCurrentPage === 0) {
						newCurrentPage = 1
						this.currentFromID = 0;
					}
					this.currentToID = this.currentFromID + (maxRecords - 1);
					this.currentPage = newCurrentPage;
					let originalID = (Math.floor(maxRecords * this.currentPage) - (maxRecords - 1));
					this.difference = this.currentFromID - originalID;
				} else {
					if (length > 0) {
						let newCurrentPage = Math.ceil(inputNumberInt / maxRecords);
						if (this.currentToID > count) {
							this.currentToID = count;
						}
						this.currentToID = newCurrentPage * maxRecords;
						this.currentPage = newCurrentPage;
						this.currentFromID = (this.currentPage - 1) * maxRecords + 1;
					}
				};
				pageEnd = Math.ceil(Math.floor(this.currentToID / maxRecords) / 10) * 10;
				pageStart = pageEnd - 9;
				this.firstPage = pageStart;
				this.lastPage = pageEnd;
				$("tbody").empty();
				// this.isFunctionRunning = false;
				return this.showRecords(this.currentFromID, this.currentToID);
			})
			.then(() => {
				return this.pageNumbers(pageStart, pageEnd);
			})
			.then(() => {
				return maxRecords;
			})
			.catch((error) => {
				throw error;
			})
	}

	// Calls the function to resize with a timeout added for precision
	resize() {
		if (this.resizeTimer !== null) {
			clearTimeout(this.resizeTimer);
		}
		this.resizeTimer = setTimeout(() => {
			this.adjustDisplayedRecords();
		}, 250);
	}

	// Just a loader to display when the table is empty and records is being fetched. 
	loader() {
		let content = $('tbody').text();
		if (content === '') {
			$('.results').append('<div class="loader"></div>');
		} else {
			$('.loader').css({ 'display': 'none' });
		}
	}

	// Calculate how many records should be displayed on the screen height
	recordsPerPage(): number {
		const screenHeight = $(window).height();
		const maxRecords = Math.floor(parseInt(screenHeight as any) / 68);
		return maxRecords;
	}

	// Retrieve the input value while a value is in the search bar
	input(): string {
		let inputNumber = $('.search-input').val() as string;
		return inputNumber;
	}
}

// First function that runs when the  web app is started
window.onload = () => {
	const dataHandler = new DataHandler();
	dataHandler.showColumns();
	dataHandler.adjustDisplayedRecords();
	dataHandler.initializePagination();
	dataHandler.initializeSearch();
	$(window).on('resize', () => {
		dataHandler.resize();
	});
}
