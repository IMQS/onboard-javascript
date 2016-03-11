module iq {
	export module onboard {

		/*
		* Generator class for new table rows/cells
		*/
		export class RowFactory {

			/*
			* Creates a new table row element populated with table header cells with the given data
			*/
			createHeaderRow(values: Array<string>): JQuery {
				let $row = $("<tr></tr>");
				for (let index in values) {
					$row.append(this.createHeaderCell(values[index]));
				}
				return $row;
			}

			/*
			* Creates a new html table row element populated with the given data
			*/
			createDataRow(values: Array<string>): JQuery {
				let $row = $("<tr></tr>");
				for (let index in values) {
					$row.append(this.createDataCell(values[index]));
				}
				return $row;
			}

			private createHeaderCell(content: string): JQuery {
				return $("<th></th>").html(content ? content : "");
			}

			private createDataCell(content: string): JQuery {
				return $("<td></td>").html(content ? content : "");
			}
		}
	}
}
