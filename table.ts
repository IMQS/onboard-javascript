class Table {

	private _from: number = 0;
	private _totalRecords: number = 0;
	private _columns: string[] = [];
	private timeout = 0;
	private rows = 0;

	constructor() {
		this.from = 0;
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
		let totalRecordsIndex = this._totalRecords - 1;

		if (totalRecordsIndex < 0)
			totalRecordsIndex = 0;

		if ((from + this.rows) > totalRecordsIndex)
			this._from = (totalRecordsIndex - this.rows);
		else if (from < 0)
			this._from = 0;
		else
			this._from = from;

	}

	get to(): number {
		let to = this._from + this.getNumberOfRows()

		if (to > this._totalRecords)
			return this._totalRecords - 1;
		else
			return to;
	}

	getColumnData(): void {
		let headerArray: string[];

		headerArray = [];

		$.ajax({
			url: 'http://localhost:2050/columns',
			dataType: 'json',
			success: (data: string[]) => {

				let tableBody = <HTMLTableSectionElement>document.getElementById("dataTableBody");

				const dataRow = tableBody.insertRow(0);

				for (let i = 0; i < data.length; i++) {
					const newCell = dataRow.insertCell(-1);
					newCell.outerHTML = `<th>${data[i]}</th>`;
				}

				this.buildTable();

			}
		});
	}


	/** determine the amount of rows to add to the table based on the size on the window */
	getNumberOfRows(): number {

		// subtract - 1 to cater for header row.
		let rows = (parseInt(((window.innerHeight - 75) / 30).toFixed(0)) - 1);

		if (rows < 0)
			return 0;
		else
			return rows;

	}

	getTotalRecords(): void {

		$.ajax({
			url: 'http://localhost:2050/recordCount',
			dataType: 'json',
			success: (data: string): void => {
				this._totalRecords = parseInt(data);
				this.getColumnData();
			}
		});
	}

	initialTableBuild() {
		this.getTotalRecords();
	}

	buildTable(): void {

		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {

			let html: string;

			// make the ajax call to retrieve the records and build the table
			$.ajax({
				url: `http://localhost:2050/records?from=${this.from}&to=${this.to}`,
				dataType: 'json',
				success: (data: string[]): void => {

					for (let row of data) {

						html = html + "<tr>"

						for (let cell of row) {
							html = html + "<td>" + cell + "</td>";
						}

						html = html + "</tr>"
					}

					$("#dataTableBody").find("tr:gt(0)").remove();
					$("#dataTableBody > tr").eq(0).after(html);

				}
			});

			buttonPropertySet();
		}, 250);
	}

}
