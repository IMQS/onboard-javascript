//*** Views ***/

/**
 * TableRenderer is responsible for rendering data into an HTML table.
 * It fetches data from the StateManager and populates the table accordingly.
 */
class TableRenderer {
	private stateManager: StateManager;

	constructor (stateManager: StateManager) {
		this.stateManager = stateManager;
	}

	/**
	 * Renders the initial table layout including column names and initial data set.
	 * @param {StateManager} stateManager - The manager to fetch state from.
	 */
	async initialRender(): Promise<void> {
		const columnNames = this.stateManager.getColumnNames();
		if (columnNames !== null) {
			this.renderColumnNames(columnNames);
		}

		await this.stateManager.retrieveRecords().catch((error) => {
			console.error("Error retrieving records in initialRender:", error);
			throw error;
		});

		const records = this.stateManager.getRecords();

		if (records !== null) {
			this.renderRecords(records);
		}
	}

	renderColumnNames(columnNames: string[]): void {
		const thead = document.querySelector("thead");
		if (thead === null) {
			throw new Error("Table header not found.");
		}

		const row = document.createElement("tr");
		for (const columnName of columnNames) {
			const cell = document.createElement("th");
			cell.textContent = columnName;
			row.appendChild(cell);
		}
		thead.appendChild(row);

		try {
			this.setColumnWidths();
		} catch (error) {
			if (error instanceof Error) {
				console.error(
					`An error occurred in setColumnWidths: ${error.message}`
				);
			} else {
				console.error(
					`An unknown error occurred in setColumnWidths: ${error}`
				);
			}
			throw error;
		}
	}

	/** Sets the widths of table columns evenly. */
	setColumnWidths(): void {
		try {
			const table = document.getElementById("myTable");

			if (!table) {
				throw new Error('Table with id "myTable" not found.');
			}

			const headerCells = table.querySelectorAll("th");
			const numCols = headerCells.length;
			const colWidth = 100 / numCols;

			headerCells.forEach((headerCell: Element) => {
				(headerCell as HTMLElement).style.width = `${colWidth}%`;
			});
		} catch (error) {
			console.error(`Error setting column widths: ${error}`);
		}
	}

	/** Populates the table body with records. Optionally highlights a specified row if searched. */
	renderRecords(records: CityData[], highlightId: number | null = null) {
		// Use the state's highlightedId if no highlightId is provided.
		highlightId = highlightId ?? this.stateManager.getHighlightedId();

		const tbody = document.querySelector("tbody");
		if (tbody === null) {
			throw new Error("Table body not found.");
		}

		tbody.innerHTML = "";

		for (const record of records) {
			const row = document.createElement("tr");
			if (
				highlightId !== null &&
				record.length > 0 &&
				parseInt(record[0].toString(), 10) === highlightId
			) {
				row.classList.add("highlight");
			}
			for (const cell of record) {
				const td = document.createElement("td");
				td.textContent = cell.toString();
				row.appendChild(td);
			}
			tbody.appendChild(row);
		}
	}
}
