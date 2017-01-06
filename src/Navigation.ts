class Navigation {
	private table: Table;

	private rowNum: number;
	private NumToFetch: number;
	private searchedId: number;
	private maxRecords: number;

	constructor(newTable: Table) {
		this.table = newTable;
		this.rowNum = 0;
		this.NumToFetch = 0;
		this.searchedId = -1;
		this.maxRecords = 0;
	}

	/**
	 * Create a bold textnode and an input field that will search through the
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
	 * Create buttons for moving throught the data one row at a time and
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


	update() {
		this.NumToFetch = Math.floor((window.innerHeight - (41 + 42)) / 24) - 1;

		if (this.NumToFetch < 0) {
			this.table.update([], this.searchedId);
			return;
		}

		if (this.rowNum < 0) {
			this.rowNum = 0;
		}

		if (this.rowNum + this.NumToFetch > this.maxRecords) {
			this.rowNum -= this.rowNum + this.NumToFetch - this.maxRecords;
	
			if (this.rowNum < 0) {
				this.rowNum = 0;
				this.NumToFetch = this.maxRecords;
			}
		}
		
		$.getJSON("http://localhost:2050/records", { from: this.rowNum, to: this.rowNum + this.NumToFetch },
			(data) => {
				this.table.update(data, this.searchedId);
			});
	}

	search() {
		console.log();
		let searchField = <HTMLInputElement>document.getElementById('search');
		let value = +searchField.value;

		if (value < 0 || value > this.maxRecords) {
			this.searchedId = -1;
			return;
		}
	
		this.searchedId = value;
		this.rowNum = value - Math.floor(((window.innerHeight - (41 + 42)) / 24 - 1) / 2);

		this.update();
	}

	moveDown() {
		if (this.rowNum + this.NumToFetch == this.maxRecords) {
			return;
		}

		this.rowNum++;

		this.update();
	}

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

	getRowNum(): number {
		return this.rowNum;
	}
}