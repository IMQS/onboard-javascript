class Row {
	private tableBody: HTMLTableSectionElement;
	private index: number;

	constructor(body: HTMLTableSectionElement, index: number) {
		this.tableBody = body;
		this.index = index;
	}

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