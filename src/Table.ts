class Table {
	private mainTable: HTMLTableElement;
	private tableHead: HTMLTableSectionElement;
	private tableBody: HTMLTableSectionElement;
	
	constructor() {
		this.mainTable = <HTMLTableElement>document.getElementById('mainTable');
		this.tableHead = this.mainTable.createTHead();
		this.tableBody = this.mainTable.createTBody();
	}

	getMainTable() {
		return this.mainTable;
	}

	getHead(): HTMLTableSectionElement {
		return this.tableHead;
	}

	/**
	 * Creates a new table body and populates it with row
	 * made from the new content and replaces the old
	 * table body.
	 *
	 * @param data The content for the new rows
	 * @param searchedId The id of the row that was searched.
	 */
	update(data: string[][], searchedId: number) {
		let newTableBody = document.createElement('tbody');

		let row: Row;
		for (let i = 0; i < data.length; i++) {
			row = new Row(newTableBody, i);
			if (+data[i][0] == searchedId) {
				row.addRow(data[i], true);
			} else {
				row.addRow(data[i], false);
			}
		}

		this.tableBody.parentNode.replaceChild(newTableBody, this.tableBody);
		this.tableBody = newTableBody;
	}
}