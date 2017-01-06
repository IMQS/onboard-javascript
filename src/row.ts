class Row {
	private tableBody: HTMLTableSectionElement;
	private index: number;							// Where the row will be inserted on the table.

	constructor(body: HTMLTableSectionElement, index: number) {
		this.tableBody = body;
		this.index = index;
	}

	/**
	 * Creates a row with the given values and inserts it in the
	 * table.
	 *
	 * @param values The contents of the row.
	 * @param bold Whether to make the content of the row bold or not.
	 */
	addRow(values: string[], bold: boolean) {
		let row = this.tableBody.insertRow(this.index);

		let cell: HTMLTableCellElement;
		for (let i = 0; i < values.length; i++) {
			cell = row.insertCell(i);

			if (bold) {
				cell.innerHTML = "<b>" + values[i] + "</b>";
			} else {
				cell.innerHTML = values[i];
			}
		}
	}
}