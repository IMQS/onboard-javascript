class Navigation {
	private table: Table;

	private rowNum: number;			// The first Id to be fetched.
	private numToFetch: number;		// The last Id to be fetched.
	private searchedId: number;
	private maxRecords: number;

	private headerRowHeight = 23;
	private bodyMargin = 8;
	private searchBarHeight = 52;
	private rowHeight = 24;

	constructor(newTable: Table) {
		this.table = newTable;
		this.rowNum = 0;
		this.numToFetch = 0;
		this.searchedId = -1;
		this.maxRecords = 0;
	}

	/**
	 * Create a bold text node and an input field that will search through the
	 * data.
	 */
	createSearchField() {
		let bold = document.createElement('b');
		let title = document.createTextNode("Search ID:");
		bold.appendChild(title);
		this.table.getMainTable().appendChild(bold);

		let searchField = document.createElement("input");
		searchField.id = "search";
		searchField.type = 'number';
		searchField.min = "0";
		searchField.oninput = () => {
			this.search();
		}
		this.table.getMainTable().appendChild(searchField);
	}

	/**
	 * Create buttons for moving through the data one row at a time and
	 * add them to the footer.
	 */
	createNavigationArrows() {
		let footer = document.getElementById('mainFooter');

		let downButton = document.createElement('button');
		downButton.onclick = () => {
			this.moveDown();
		}
		let imgDown = document.createElement('img');
		imgDown.setAttribute('src', "icons/button_down.png");
		downButton.appendChild(imgDown);
		footer.appendChild(downButton);

		let upButton = document.createElement('button');
		upButton.onclick = () => {
			this.moveUp();
		}
		let imgUp = document.createElement('img');
		imgUp.setAttribute('src', "icons/button_up.png");
		upButton.appendChild(imgUp);
		footer.appendChild(upButton);
	}

	/**
	 * Calculates how much data should be fetched from the server based on
	 * the height of the web page.
	 * The id's from value 'rowNum' until 'numToFetch' is then fetched from
	 * the server and the table is then updated.
	 */
	update() {
		this.numToFetch = Math.floor((window.innerHeight - (this.headerRowHeight +
			this.bodyMargin + this.searchBarHeight)) / this.rowHeight) - 1;

		if (this.numToFetch < 0) {
			this.table.update([], this.searchedId);
			return;
		}

		if (this.rowNum < 0) {
			this.rowNum = 0;
		}

		if (this.rowNum + this.numToFetch > this.maxRecords) {
			this.rowNum -= this.rowNum + this.numToFetch - this.maxRecords;
	
			if (this.rowNum < 0) {
				this.rowNum = 0;
				this.numToFetch = this.maxRecords;
			}
		}
		
		$.getJSON("http://localhost:2050/records", { from: this.rowNum, to: this.rowNum + this.numToFetch },
			(data) => {
				this.table.update(data, this.searchedId);
			});
	}

	/**
	 * Gets a value from the input field with id 'search' and then adjusts
	 * the value 'rowNum' to make the searched row appear as close to the middle
	 * of the window as possible.
	 */
	search() {
		console.log();
		let searchField = <HTMLInputElement>document.getElementById('search');
		let value = +searchField.value;

		if (value < 0 || value > this.maxRecords) {
			this.searchedId = -1;
			return;
		}
	
		this.searchedId = value;
		this.rowNum = value - Math.floor(((window.innerHeight - (this.headerRowHeight +
			this.bodyMargin + this.searchBarHeight)) / this.rowHeight - 1) / 2);

		this.update();
	}

	/**
	 * Increments the 'rowNum' value and updates the table.
	 */
	moveDown() {
		if (this.rowNum + this.numToFetch == this.maxRecords) {
			return;
		}

		this.rowNum++;

		this.update();
	}

	/**
	 * Decrements the 'rowNum' value and updates the table.
	 */
	moveUp() {
		if (this.rowNum == 0) {
			return;
		}

		this.rowNum--;

		this.update();
	}

	setMaxRecords(max: number) {
		this.maxRecords = max;
	}
}