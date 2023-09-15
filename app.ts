import { ajax, css } from "jquery";

class RecordManager {
	firstNumber: number;
	lastNumber: number;
	recordCount: number;

	constructor() {
		this.firstNumber = 0;
		this.lastNumber = 0;
		this.recordCount = 0;
		this.initialize();
	}

	initialize() {
		this.createTableHeader();
		dataManager.fetchRecordCount()
			.then(count => {
				this.recordCount = count - 1;
				this.updateAndDisplayRecords();
				this.recordEventHandlers();
				this.handleResize();
			})
			.catch(err => {
				alert('Error fetching and displaying the table records, reload the page');
				throw err;
			});
	}

	/** Initializes the table head */
	createTableHeader() {
		return dataManager.fetchColumns()
			.then(columns => {
				for (const col of columns) {
					$(".head").append(`<th>${col}</th>`);
				}
			})
			.catch(err => {
				alert('Error creating table heading');
				throw err;
			});
	}

	/** calculates the number of rows that can fit the screen */
	calculatingRows(): number {
		const screenHeight = window.innerHeight;
		const availableHeight = screenHeight - 105;
		let rowHeight = 35;
		if (availableHeight <= 0) {
			return 0;
		} else {
			let maxRows = Math.floor(availableHeight / rowHeight);
			return maxRows;
		}
	}

	/** fetching records that fit the screen */
	updateAndDisplayRecords(): Promise<void> {
		const inputValue = <string>($('#searchInput').val());
		let errorMessage = '';
		if (inputValue !== '') {
		  errorMessage = 'Failed to search, reload the page and search again';
		  $('#loader').show();
		  this.searchRecordsAndResize();
		} else {
		  errorMessage = 'Error to fetch and display records, reload the page';
		  $('#loader').show();
		}
		this.calculateFirstAndLastNumbers();
		this.updateArrowVisibility();
		return this.fetchAndDisplayRecords()
		  .then(() => {
			$('#loader').hide();
		  })
		  .catch(err => {
			alert(errorMessage);
			throw err;
		  });
	  }	  

	/** Calculates the firstNumber and lastNumber */
	calculateFirstAndLastNumbers() {
		let rowsPerPage = this.calculatingRows();
		if (this.firstNumber < 0) {
			this.firstNumber = 0;
		} else {
			this.firstNumber = this.firstNumber;
		}
		this.lastNumber = this.firstNumber + (rowsPerPage - 1);
		if (this.lastNumber >= this.recordCount) {
			this.firstNumber = this.recordCount - (rowsPerPage - 1);
			this.lastNumber = this.recordCount;
		}
	}

	updateArrowVisibility() {
		if (this.firstNumber === 0) {
			$('.arrow-left').hide();
		} else {
			$('.arrow-left').show();
		}
		if (this.lastNumber >= this.recordCount) {
			$('.arrow-right').hide();
		} else {
			$('.arrow-right').show();
		}
	}

	fetchAndDisplayRecords(): Promise<void> {
		return dataManager.fetchRecords(this.firstNumber, this.lastNumber)
			.then(records => {
				const inputValue = <string>($('#searchInput').val());
				$("#tableBody").empty();
				for (const record of records) {
					// creates row for each record
					$("tbody").append(`<tr class="row"></tr>`);
					const lastRow = $(".row:last");
					for (const value of record) {
						// assign each record to their column in a specified row
						lastRow.append(`<td>${value}</td>`);
						if (value === inputValue) {
							// highlights the searched row 
							lastRow.css('background-color', '#DDC0B4');
						}
					}
					$("tbody").append(lastRow);
				}
				$('#page').empty().append(`Showing record: ${this.firstNumber} - ${this.lastNumber}`);
				$('#loader').hide();
			})
			.catch(err => {
				alert('Error while displaying records, reload the page');
				throw err;
			});
	}

	/** recalculates the record range that includes inputValue fromm user */
	searchRecordsAndResize() {
		let inputValue = <number>($('#searchInput').val());
		if (inputValue < 0 || inputValue > this.recordCount) {
			$('.modal').css('display', 'block');
			$('.content').append(`<p>${inputValue} is not a number within the range. Please try a different number</p>`);
			$('#page').empty().append(`Showing record: ${this.firstNumber} - ${this.lastNumber}`);
			$('#searchInput').val('');
			return;
		}
		let calculatedRows = this.calculatingRows();
		// divides the calculated max rows in half
		const halfRange = Math.floor(calculatedRows / 2);
		this.firstNumber = Math.max(0, inputValue - halfRange);
		this.lastNumber = Math.min(this.recordCount, this.firstNumber + (calculatedRows - 1));
	}

	/** Navigates to the next set of records */
	rightArrow() {
		$('#searchInput').val('');
		// retrieves the last row
		const lastRow = document.querySelector("#recordsTable tbody .row:last-child");
		// checks if the last row exists 
		if (lastRow) {
			const cells = lastRow.querySelectorAll("td");
			if (cells.length > 0) {
				// Get the value of the first cell 
				const lastID = parseFloat(cells[0].textContent || "");
				// checks if the last value is within range 
				if (0 <= lastID && lastID <= this.recordCount) {
					// calculates the first number of the page 
					this.firstNumber = lastID + 1;
					const calculatedRows = this.calculatingRows();
					// calculates the last number of the page 
					this.lastNumber = this.firstNumber + (calculatedRows - 1);
				}
			}
		}
		this.updateAndDisplayRecords();
	}

	leftArrow() {
		$('#searchInput').val('');
		// retrieves the first row 
		const firstRow = document.querySelector("#recordsTable tbody .row:first-child");
		if (firstRow) {
			const cells = firstRow.querySelectorAll("td");
			if (cells.length > 0) {
				const firstID = parseFloat(cells[0].textContent || "");
				if (0 <= firstID && firstID <= this.recordCount) {
					const calculatedRows = this.calculatingRows();
					this.lastNumber = firstID - 1;
					this.firstNumber = this.lastNumber - (calculatedRows - 1);
				}
			}
		}
		this.updateAndDisplayRecords();
	}

	/** calls to re-display records when screen is adjusted */
	handleResize() {
		let resizeTimeout: number;
		$(window).on('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				$('#loader').show();
				this.updateAndDisplayRecords()
					.then(() => {
						$('#loader').hide();
					})
					.catch(err => {
						alert('Error occurred while resizing, reload the page');
						$('#loader').hide();
						throw err;
					});
			}, 250);
		});
	}

	recordEventHandlers() {
		$('#btnSearch').on('click', (event) => {
			event.preventDefault();
			this.updateAndDisplayRecords();
		});

		$('.arrow-right').on('click', () => {
			this.rightArrow();
		});

		$('.arrow-left').on('click', () => {
			this.leftArrow();
		});

		$('#closeModalBtn').on("click", () => {
			$('.content').empty();
			$('.modal').css('display', 'none');
		});

		$('#searchInput').on('keydown', (event) => {
			if (event.key === 'e' || event.key === 'E') {
				event.preventDefault();
			}
		});

		$('#searchInput').on('input', () => {
			const inputValue = <string>$('#searchInput').val();
			if (inputValue.includes('.')) {
				$('#searchInput').val(inputValue.replace('.', ''));
			}
		});
	}
}

window.onload = () => {
	new RecordManager();
}
