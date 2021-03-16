class Table {

	private _from: number = 0;
	//private _to: number;
	private _totalRecords: number;
	private _columns: string[];

	constructor() {
		this.from = 0;
		//this._to = this.to;
		this._totalRecords = getTotalRecords();
		this._columns = this.getColumnData();
	}

	get totalRecords(): number {
		return this._totalRecords
	}

	get columns(): string[] {
		return this._columns;
	}

	get from(): number {
		return this._from;
	}

	set from(from: number) {
		let totalRecordsIndex: number = this._totalRecords - 1;

		if ((from + this.getNumberOfRows()) > totalRecordsIndex)
			this._from = (totalRecordsIndex - this.getNumberOfRows());
		else if (from < 0)
			this._from = 0;
		else
			this._from = from;

		//this._to = this.to;

	}

	get to(): number {
		let to = this._from + this.getNumberOfRows()

		if (to > this._totalRecords)
			return this._totalRecords - 1;
		else
			return to;
	}

	getColumnData(): string[] {
		let headerArray: string[];

		headerArray = [];

		$.ajax({
			url: 'http://localhost:2050/columns',
			dataType: 'json',
			async: false,
			success: (data: string[]) => {

				for (let index = 0; index < data.length; index++) {
					headerArray[index] = data[index];
				}
			}
		});

		return headerArray;
	}


	/** determine the amount of rows to add to the table based on the size on the window */
	getNumberOfRows(): number {
		let rows: number;

		// subtract - 1 to cater for header row.
		let height = (parseInt(((window.innerHeight - 75) / 30).toFixed(0)) - 1);
		let width = (parseInt(((window.innerWidth - 75) / 30).toFixed(0)) - 1);

		if (height < width)
			rows = height;
		else
			rows = width;

		if (rows < 0)
			return 0;
		else
			return rows;

	}

	getTotalRecords(): number {
		const HttpRequest = new XMLHttpRequest();
		const url = 'http://localhost:2050/recordCount';
		HttpRequest.open("GET", url, false);
		HttpRequest.send();

		const responseText = HttpRequest.responseText

		return parseInt(responseText);
	}

	buildTable = (): void => {
		$("#dataTableBody").find("tr").remove();

		let tableBody = <HTMLTableSectionElement>document.getElementById("dataTableBody");

		// make the ajax call to retrieve the records and build the table
		$.ajax({
			url: `http://localhost:2050/records?from=${this.from}&to=${this.to}`,
			dataType: 'json',
			async: true,
			success: (data: string[]): void => {

				for (let row of data) {
					const dataRow = tableBody.insertRow(-1);
					for (let cell of row) {
						const newCell = dataRow.insertCell(-1);
						newCell.innerHTML = cell
					}
				}
			}
		});

		tableBody = <HTMLTableSectionElement>document.getElementById("dataTableBody");

		const dataRow = tableBody.insertRow(0);

		for (let i = 0; i < myTable.columns.length; i++) {
			const newCell = dataRow.insertCell(-1);
			newCell.outerHTML = `<th>${myTable.columns[i]}</th>`;
		}

		// call the button property set fucntion to set disable/enable buttons appropriately
		buttonPropertySet();

	}

}
