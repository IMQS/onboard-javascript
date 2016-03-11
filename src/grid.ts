/// <reference path="../scripts/typings/jquery/jquery.d.ts" />

module iq {
	export module onboard {

		/*
		* Generic tabulated data handling class.
		* Provides functionality for connecting the specific API for the onboarding project
		* and loading the records into a given html table
		*/
		export class Grid {

			constructor(public table: string) {
				this.rowFactory = new RowFactory();
				this.redraw();
			};

			/*
			* Remeasure the table constraints and refresh data display
			*/
			redraw(): void {
				this.loadColumnHeaders();
			}

			/*
			* Switches to the page which is [offset] pages from the current page
			*/
			pageBy(offset: number): number {
				this.pageTo(this.page + offset);
				return this.page;
			};

			/*
			* Switch to the first page
			*/
			pageToFirst(): void {
				this.pageTo(0);
			};

			/*
			* Switch to the last page
			*/
			pageToLast(): void {
				this.pageTo(this.numberOfPages-1);
			};

			/*
			* Sets the zero based page number and updates the grid data
			*/
			pageTo(page: number): void {
				if (page >= this.numberOfPages) {
					console.log("Cant page to " + (page+1) + " because there are only " + this.numberOfPages + " pages!");
					page = this.numberOfPages-1;
				}
				if (page < 0) {
					console.log("Page number must be positive!");
					page = 0;
				}

				console.log("Page: " + page);

				this.page = page;

				this.loadRecords(this.page * this.recordsPerPage, this.recordsPerPage - 1);
			};

			/*
			* Gets the currently displayed page number (zero based)
			*/
			getPageNumber(): number {
				return this.page;
			};

			/*
			* Gets the total number of pages in the record set
			*/
			getNumberOfPages(): number {
				return this.numberOfPages;
			};

			private static DefaultRecordsPerPage: number = 20;
			private numberOfRecords: number = -1;
			private page: number = 0;
			private numberOfPages: number = -1;
			private recordsPerPage: number = Grid.DefaultRecordsPerPage;
			private rowFactory: RowFactory;

			private loadNumberOfRecords(): void {
				$.getJSON("/recordCount", (val: number) => {
					this.numberOfRecords = val;

					// Calculate the number of rows that will fit on the screen ( less the header and padding)
					this.recordsPerPage = Math.floor($(this.table).height() / $("tr:first-child").height()) - 2;	
					this.numberOfPages = Math.ceil(this.numberOfRecords / this.recordsPerPage);
					this.pageTo(this.page);
				});
			};

			private loadColumnHeaders(): void {
				$.getJSON("/columns", (val: Array<string>) => {
					this.setColumnHeaders(val);
					this.loadNumberOfRecords();
				});
			};

			private loadRecords(skip: number, count: number) {
				let end = skip + count;
				if (end >= this.numberOfRecords) {
					end = this.numberOfRecords - 1;
				}

				$.getJSON("/records?from=" + skip + "&to=" + end, (records: Array<Array<string>>) => {
					this.clearData();
					this.addData(records);
				});
			};

			private setColumnHeaders(cols: Array<string>) {
				let $table = $(this.table);
				if ($table) {
					$table.find("tr").remove();		// Remove any existing data/header row
					$table.append(this.rowFactory.createHeaderRow(cols));

					// Append a filler row to prevent header row expanding across table
					$table.append($("<tr class='filler'><td>Fetching data...</td></tr>"));
				}
			};

			private clearData() {
				let $table = $(this.table);
				if ($table) {
					$table.find("tr:gt(0)").remove();	// Removes all except first (header) row
				}
			};

			private addData(records: Array<Array<string>>) {
				let $table = $(this.table);
				if ($table) {
					for (let ind in records) {
						$table.append(this.rowFactory.createDataRow(records[ind]));
					}
				}
			};
		}
	}
}
