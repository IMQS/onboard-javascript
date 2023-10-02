class RecordManager {
	firstNumber: number;
	lastNumber: number;
	recordCount: number;
	data: dataManager;

	constructor() {
		this.data = new dataManager();
		this.firstNumber = 0;
		this.lastNumber = 0;
		this.recordCount = 0;
	}

	initialize() {
		let promiseArray: Promise<void>[] = [];
		promiseArray.push(this.createTableHeader());
		let recordCountPromise = this.data.fetchRecordCount()
			.then(count => {
				this.recordCount = count - 1;
				this.updateAndDisplayRecords();
				this.recordEventHandlers();
				this.handleResize();
			})
			.catch(err => {
				throw new Error('Error fetching and displaying the table records, reload the page' + err);
			});
		promiseArray.push(recordCountPromise);
		return Promise.all(promiseArray);
	}

	/** Initializes the table head */
	createTableHeader(): Promise<void> {
		return this.data.fetchColumns()
			.then(columns => {
				for (const col of columns) {
					$(".head").append(`<th>${col}</th>`);
				}
			})
			.catch(err => {
				alert('Error creating table heading'+ err);
			});
	}

	/** calculates the number of rows that can fit the screen */
	getNumberOfCalculatingRows(): number {
		const screenHeight = window.innerHeight;
		const availableHeight = screenHeight - 110;
		const rowHeight = 35;
		if (availableHeight <= 0) {
			return 0;
		} else {
			let maxRows = Math.floor(availableHeight / rowHeight);
			return maxRows;
		}
	}

	/** fetching records that fit the screen */
	updateAndDisplayRecords(): Promise<void> {
		$('#loader').show();
		this.calculateFirstAndLastNumbers();
		this.updateArrowVisibility();
		return this.fetchAndDisplayRecords()
			.then(() => {
				$('#loader').hide();
			})
			.catch(err => {
				alert('Error to fetch and display records, reload the page'+ err);
			});
	}

	/** Calculates the firstNumber and lastNumber */
	calculateFirstAndLastNumbers() {
		let rowsPerPage = this.getNumberOfCalculatingRows();
		if (this.firstNumber < 0) {
			this.firstNumber = 0;
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
		return this.data.fetchRecords(this.firstNumber, this.lastNumber)
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
				alert('Error while displaying records, reload the page'+ err);
			});
	}

	/** recalculates the record range that includes inputValue fromm user */
	searchRecordsAndResize() {
		let inputValue = <number>($('#searchInput').val());
		if (inputValue >= 0 && inputValue <= this.recordCount) {
			let calculatedRows = this.getNumberOfCalculatingRows();
			// divides the calculated max rows in half
			const halfRange = Math.floor(calculatedRows / 2);
			this.firstNumber = Math.max(0, inputValue - halfRange);
			this.lastNumber = Math.min(this.recordCount, this.firstNumber + (calculatedRows - 1));
		} else {
			alert(`Input value must be between 0 and ${this.recordCount}`);
		}
	}

	/** Navigates to the next set of records */
	navigateToNextPage() {
		$('#searchInput').val('');
		if (0 <= this.lastNumber && this.lastNumber <= this.recordCount) {
			// calculates the first number of the page 
			this.firstNumber = this.lastNumber + 1;
			const calculatedRows = this.getNumberOfCalculatingRows();
			// calculates the last number of the page 
			this.lastNumber = this.firstNumber + (calculatedRows - 1);
		}
		return this.updateAndDisplayRecords()
			.catch(err => {
				alert('Error to fetch and display records, reload the page' + err);
			});
	}

	navigateToPreviousPage() {
		$('#searchInput').val('');
		if (0 <= this.firstNumber && this.firstNumber <= this.recordCount) {
			const calculatedRows = this.getNumberOfCalculatingRows();
			this.lastNumber = this.firstNumber - 1;
			this.firstNumber = this.lastNumber - (calculatedRows - 1);
		}
		return this.updateAndDisplayRecords()
			.catch(err => {
				alert('Error to fetch and display records, reload the page' + err);
			});
	}

	/** calls to re-display records when screen is adjusted */
	handleResize() {
		let resizeTimeout: number;
		let inputValue = <string>($('#searchInput').val());
		$(window).on('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				$('#loader').show();
				if (inputValue !== '') {
					this.searchRecordsAndResize();
				}
				this.updateAndDisplayRecords()
					.then(() => {
						$('#loader').hide();
					})
					.catch(err => {
						alert('Error occurred while resizing, reload the page' + err);
						$('#loader').hide();
					});
			}, 250);
		});
	}

	recordEventHandlers() {
		$('#btnSearch').on('click', (event) => {
			event.preventDefault();
			this.searchRecordsAndResize();
			return this.updateAndDisplayRecords()
				.catch(err => {
					alert('Error to fetch and display records, reload the page' + err);
				});
		});

		$('.arrow-right').on('click', () => {
			this.navigateToNextPage();
		});

		$('.arrow-left').on('click', () => {
			this.navigateToPreviousPage();
		});

		$('#searchInput').on('input', () => {
			const inputValue = <string>$('#searchInput').val();
			if (inputValue !== undefined) {
				let correctValue = inputValue.replace(/[^0-9]/g, '');
				$('#searchInput').val(correctValue);
			}
		});
	}
}

window.onload = () => {
	const record = new RecordManager();
	record.initialize();
}
