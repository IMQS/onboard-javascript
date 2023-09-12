/** manage the grid template and display records */
class GridTemplate {
	private columnNames: ColumnName[] = [];
	private dataRecords: GridData[] = [];

	/** Initializes the column names and data records that will be used to display records in the grid. */
	constructor(columnNames: ColumnName[], dataRecords: GridData[]) {
		this.columnNames = columnNames;
		this.dataRecords = dataRecords;
	}

	/** Display records in a grid in table format */
	displayRecords(): void {

		const gridElement = document.getElementById('grid');
		if (gridElement) {
			gridElement.innerHTML = '';
			const table = document.createElement('table');
			const thead = document.createElement('thead');
			const headerRow = document.createElement('tr');
			for (const column of this.columnNames) {
				const th = document.createElement('th');
				th.textContent = column.name;
				headerRow.appendChild(th);
			}
			thead.appendChild(headerRow);
			table.appendChild(thead);
			// Create table body
			const tbody = document.createElement('tbody');
			for (const row of this.dataRecords) {
				const tr = document.createElement('tr');
				for (const column of this.columnNames) {
					const td = document.createElement('td');
					td.textContent = row[column.name];
					tr.appendChild(td);
				}
				tbody.appendChild(tr);
			}
			table.appendChild(tbody);
			// Append the table to the grid element
			gridElement.appendChild(table);
		}
	}
}
