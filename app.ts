/// <reference path="third_party/jquery.d.ts" />

module page {

    var data: CData;				// Instance of CData class that retrieves and stores server data
    var grid: CGrid;				// Instance of CGrid class that creates and updates the grid DOM

    export function Start() {
        // Class instantiation
		// Data containter class
        data = new CData();
		//Pass the id of the DOM element manipulated by the class
        grid = new CGrid("grid-view");

        $(document).ready(function () {
			// Fetch required information first, record count and record length
            $.when(data.getRecordCount('/recordCount', data.setRecordCount.bind(data)),
                data.getColumnNames('/columns', data.setColumnNames.bind(data))).done(function () {

					// Initialise the elements for the navigation class
					grid["nav"]["baseRows"] = grid.getRowCount();
					grid["nav"]["cntRow"] = grid["nav"]["baseRows"];
					grid["nav"]["cntLen"] = grid["nav"]["baseRows"];
					grid["nav"]["cntMax"] = data.recordCount;
					grid["nav"]["idxPage"] = 0;

					// Navigate to the first page of data
					grid["nav"].first();
					move();
				                
					/**
				 	 * Only register the on click handlers of the buttons after necessary data has
					 * been retrieved from server 
					 *
					 * First button on click event handler
					 */
					$("#grid-first").click(() => {
						grid["nav"].first();
						move();
					});
					//Previous button on click event handler
					$("#grid-prev").click(() => {
						grid["nav"].prev();
						move();
					});
					//Next button on click event handler
					$("#grid-next").click(() => {
						grid["nav"].next();
						move();
					});
					//Last button on click event handler
					$("#grid-last").click(() => {
						grid["nav"].last();
						move();
					});
					//Register Search button on click event handler
					$("#grid-search").click(onSearch);
				});
        });
    };

	/**
	 * Update the table/grid to reflect the page of data requested.
	 * The update to the DOM is only performed after retrieving the records from the server
	 */
    function move() {
        $.when(data.getRecords('/records', grid["nav"]["idxPage"], (grid["nav"]["cntLen"]), data.setRecords.bind(data))).done(function () {
			grid.update(data);
        });
    };

	//Utilise the SEARCH functionality on the data set
    function onSearch(): void {
		//Verify text against being empty and to consist only of numbers
        var text = $('#grid-text').val();
        if ((!text) || (/[a-zA-Z]/.test(text))) {
            alert('Search string either empty or contains alphabetic letter(s).\nPlease type the requested record number.');
        } else {
			//Parse input string to number
            var searchId = parseInt(text);
            if (!searchId) {

            } else {
                grid["nav"]["idxSearch"] = searchId;
                grid["nav"].search();

				// Update the DOM
                move();
				/**
				 * Corrects the page index to the start value of the next page
				 * seeing that record retrieval for the next page has to start there.
				 * This corrects page's pointer to available data on the server, but does
				 * not update the DOM
				 */
                grid["nav"].next();
            }
        }
    };

	class CValid {
		private state: boolean = true;	// Member used to validate conditions against
		constructor(init?: boolean) {
			if (init) {
				/**
				 * Set the initial state if parameter is passed into constructor,
				 * otherwise the default assigned state is used
				 */
				this.state = init;
			}
		}
		/**
		 * Evaluates a condition to the current overall 
		 * state of validation for particular instance
		 */
		condition(state: boolean): boolean {
			this.state = this.state && (state);
			return this.state;
		}

		// Retrieves the current overall validation state
		getState(): boolean {
			return this.state;
		}

	}

    class CData {
		valid: CValid;				// Instance of validation class
        recordCount: number = 0;	// Number of records available on the server
        columnNames: Array<string>;	// Table column headings from the server
        recordData: string[][];     // Page of record data from the server  

        constructor() {
			this.valid = new CValid();	// Instantiate validation class with default start state
			this.recordData = [];		// Instantiate member
        }

		/**
		 * Callback for asynchronuous request to server for /recordCount
		 * Set the apropriate class member
		 */
        setRecordCount(count: number, state: boolean): void {
			if (!this.valid.condition(state)) {
				alert("ERROR: Invalid data from server.\nPlease reload page.");
            } else {
                this.recordCount = count;
            }
        };

		/**
		 * Asyncronuous request to server for /recordCount
		 */
        getRecordCount(url: string, fn: (count: number, state: boolean) => void) {
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (data) {
                    fn(data, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /recordCount from server.");
                }
            });
        };

		/**
		 * Callback for asynchronuous request to server for /columns
		 * Set the apropriate class member
		 */
        setColumnNames(names: string[], state: boolean): void {
            if (!this.valid.condition(state)) {
				alert("ERROR: Invalid data from server.\nPlease reload page.");
            } else {
				// Member explicitly intialised (and flushed), no verification of state required
				this.columnNames = [];
				$.each(names, function (key, value) {
					this.columnNames[key] = value;
				}.bind(this));
            }
        };

		/**
		 * Asyncronuous request to server for /columns
		 */
        getColumnNames(url: string, fn: (names: string[], state: boolean) => void) {
            var names: Array<string>;
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (columns) {
                    fn(columns, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /columns from server.");
                }
            });
        };

	    /**
		 * Callback for asynchronuous request to server for /records
		 * Set the apropriate class member
		 */
        setRecords(records: string[][], state: boolean): void {
			if (!this.valid.condition(state)) {
				alert("ERROR: Invalid data from server.\nPlease reload page.");
            } else {
				// Member explicitly intialised (and flushed), no verification of state required
				this.recordData = [];
				$.each(records, function (key, value) {
					this.recordData[key] = value;
				}.bind(this));
            }
        };

		/**
		 * Asyncronuous request to server for /records
		 */
        getRecords(url: string, idxStart: number, Len: number, fn: (records: string[][], state: boolean) => void) {
            url = url.concat("?from=" + idxStart.toString() + "&to=" + (parseInt(((idxStart + Len - 1).toString()))).toString());
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: true,
                success: function (records) {
                    fn(records, true);
                },
                error: function (msg) {
                    alert("ERROR: Cannot retrieve /records from server.");
                }
            });
        };
    }

    class CNav {
        idxSearch: number = 0;	// Search literal from input
        idxPage: number = 0;    // Current record start index for page
        cntRow: number = 0;		// Number of rows to populate for page
		baseRows: number = 0;	// Fixed number of rows that the DOM can fit into available space
        cntMax: number = 0;		// Maximum number of records available as per server request
        cntLen: number = 0;		// Length of page data request

		/**
		 * Logic to move the index of data pointed to when requesting to see the FIRST page
		 * Absolute location at the start of data
		 */
        first(): void {
            this.idxPage = 0;
			this.cntRow = this.baseRows;
            this.cntLen = this.cntRow;
        };

		/**
		 * Logic to move the index of data pointed to when requesting to see the NEXT page
		 * Relative to the current location
		 */
        next(): void {
            var idx = (this.idxPage + this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = idx;
                this.cntRow = this.baseRows;
                this.cntLen = this.cntRow;
            } else {
                this.cntLen = ((this.cntMax - this.idxPage));
                this.cntRow = this.cntLen;
            }
        };

	    /**
		 * Logic to move the index of data pointed to when requesting to see the PREVIOUS page
		 * Relative to the current location
		 */
        prev(): void {
            var idx = (this.idxPage - this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = idx;
                this.cntRow = this.baseRows;
            } else {
                this.idxPage = 0;
                this.cntRow = this.baseRows;
            }
            this.cntLen = this.cntRow;
        };

		/**
		 * Logic to move the index of data pointed to when requesting to see the LAST page
		 * Absolute location at the end of data, showing the entire last page of data
		 */
        last(): void {
            this.idxPage = ((this.cntMax - this.baseRows));
            this.cntRow = this.baseRows;
            this.cntLen = this.cntRow;
        };

		/**
		 * Logic to move the index of data pointed to when requesting aparticular record via SEARCH
		 * Absolute location with the record index at the start of the table
		 */
        search(): void {
            var idx = (this.idxSearch + this.baseRows);
            if ((idx >= 0) && (idx <= (this.cntMax - 1))) {
                this.idxPage = this.idxSearch;
                this.cntRow = this.baseRows;
                this.cntLen = this.cntRow;
            } else {
                this.idxPage = this.idxSearch;
                this.cntLen = ((this.cntMax - this.idxPage));
                this.cntRow = this.cntLen;
            }
        };
    }

	/** 
	 * Used to implement the three different methods of building the table
     * Performed a small performance evaluation on the three methods
	 */
	enum eCreateType {
		ELEMENTS,
		JQUERY,
		STRING
	};

    class CGrid {
        nav = new CNav();
		id: string;

        private rowHeight: number = 20;	// Default row height for number of row calculations
        private hdrHeight: number = 20;	// Default header height for number of row calculations
		private eCreate: eCreateType = eCreateType.STRING;	// Default method of DOM creation

        constructor(id: string) {
			this.id = id;
        }

		/**
		 * Removes the current, re-creates and updates the DOM elements of the table
		 * with the latest page data
		 */
		update(data: CData): void {
			if (!data.valid.getState()) {
				alert("ERROR: Corrupt data set.\nPlease reload page.");
			} else {
				$("#" + this.id).children().remove();
				this.create(data.columnNames.length, true, data.columnNames);
				for (var idxData = 0; idxData < (this["nav"]["cntRow"]); idxData++) {
					this.create(data.columnNames.length, false, data.recordData[idxData]);
				}
			}
        };

		getRowCount(): number {
            /**
			 * This calculation excludes the header row since the header can be of different dimensions
			 * Subtract a few rows to ensure the scroll bar is not visible at all times (eliminate the tolerance)
			 * clientWidth and clientHeight does not include the scrollbar dimensions and is thus used.
			 */
            return (parseInt(((((document.documentElement.clientHeight) - (document.documentElement.offsetHeight + this.getHdrHeight())) / this.getRowHeight())).toString()) - 2);
        };

        private getHdrHeight(): number {
			// Create phantom DOM object
			var $el = $("<th></th>").hide().appendTo("body");
			// Read CSS style sheet properties
			var height = parseInt($el.css("height"));

			this.hdrHeight = height;
            return this.hdrHeight;
        };

        private getRowHeight(): number {
			// Create phantom DOM object
			var $el = $("<td></td>").hide().appendTo("body");
			// Read CSS style sheet properties
			var height = parseInt($el.css("height"));

			this.rowHeight = height;
			return this.rowHeight;
        };

		/**
		 * Only one of the three methods is used.
		 * Left all three methods in the code for comparing performmance and as a 
		 * future reference to self
		 */
		private create(cntCol: number, fHdr: boolean, rowData: string[]): void {
			var start = new Date().getTime();
			switch (this.eCreate) {
				case eCreateType.ELEMENTS:
					{
						// Implement using HTML elements
						var rowElement = document.createElement("tr");
						for (var idxCol = 0; idxCol < cntCol; idxCol++) {
							rowElement.appendChild(document.createElement((fHdr) ? "th" : "td")).textContent = rowData[idxCol];
						}
						document.getElementById(this.id).appendChild(rowElement);
						break;
					}
				case eCreateType.JQUERY:
					{
						// Implement using JQuery components
						var jrow = $("<tr />");
						for (var idxCol = 0; idxCol < cntCol; idxCol++) {
							jrow.append($((fHdr) ? "<th />" : "<td />").text(rowData[idxCol]));
						}
						$("#" + this.id).append(jrow);
						break;
					}
				case eCreateType.STRING:
					{
						// Build a static string that describes the HTML
						var row: string;
						row += "<tr>";
						if (!rowData) {
						} else {
							for (var idxCol = 0; idxCol < cntCol; idxCol++) {
								row += (fHdr) ? "<th>" : "<td>";
								row += rowData[idxCol];
								row += (fHdr) ? "</th>" : "</td>";
							}
							row += "</tr>";
							$("#" + this.id).append(row);
						}
						break;
					}
				default:
					{
						alert("ERROR: Grid not created.\n Please reload page");
					}
			}
			// Only for performance considerations
			var time = (new Date().getTime() - start);
		}
    }
}

window.onload = () => {
	page.Start();
};
