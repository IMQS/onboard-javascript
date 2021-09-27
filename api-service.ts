class ApiService {

    private url = "http://localhost:2050";   // Backend server URL 
    private columnNames: string[] = [];     // The names of all the columns in order
    private totalRecords = 0;               // The total number of records

    // A 2-D array of the records retrieved
    // The 1st dimension is the ID that is the index of the record
    // The 2nd dimension is the ordered respective column values of the record
    private dataRecords: string[][] = [[]];
    private topRecordIndex = 0;             // The ID of the first record in the grid displayed
    private gridSize: number;               // The size of the grid to display

    constructor(numberOfRecords: number) {
        this.gridSize = numberOfRecords;    // Initialise the class with the available size of the grid

        // Send AJAX request to server to retrieve the all the column names to display
        $.ajax({
            "url": this.url + "/columns",
            "success": data => {
                this.columnNames = JSON.parse(data);
            }
        });
    }

    recordCount(): Promise<Number> {
        return new Promise((resolve, reject) => {
            $.ajax({
                "url": this.url + "/recordCount",
                "success": data => {
                    resolve(this.totalRecords = Number(data));
                },
                "error": (e) => {
                    reject(e);  // Log the error for debugging purposes
                }
            });
        });
    }

    getCurrentRecords(): Promise<string[][]> {
        let toId: number;
        // Calculate the "to" parameter for the records to collect
        if (this.topRecordIndex + (this.gridSize - 1) > (this.totalRecords - 1)) {
            toId = this.totalRecords - 1;
            this.topRecordIndex = this.totalRecords - this.gridSize;
        } else {
            toId = this.topRecordIndex + (this.gridSize - 1);
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                "url": this.url + "/records",
                "data": {
                    "from": this.topRecordIndex.toString(),
                    "to": toId.toString()
                },
                "success": data => {
                    resolve(this.dataRecords = JSON.parse(data));    // Store result privately
                },
                "error": (e) => {
                    reject(e);  // Log the error for debugging purposes
                }
            });
        });
    }

    previous(): Promise<string[][]> | null {
        if (this.topRecordIndex === 0) {
            return null;
        }
        // Check if there are records to the left of the top index of the grid before sending a request
        if (this.topRecordIndex - (this.gridSize - 1) > -1) {
            this.topRecordIndex -= this.gridSize;
        } else {
            this.topRecordIndex = 0;
        }
        return this.getCurrentRecords();
    }

    next(): Promise<string[][]> | null {
        // Check if there are records to the right of the top index of the grid before sending a request
        if (this.topRecordIndex + (this.gridSize - 1) < (this.totalRecords - 1)) {
            this.topRecordIndex += this.gridSize;
            return this.getCurrentRecords();
        }
        return null;
    }

    searchRecord(id: string): Promise<void> {
        this.topRecordIndex = Number(id);   // The searched value will always be the top record's ID
        return this.getCurrentRecords().then((dataRecords) => {
            for (let record of dataRecords) {
                if (record[0] == id) {
                    record.unshift('searched');
                }
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    getColumnNames(): string[] {
        return this.columnNames;
    }

    getTotalRecords(): number {
        return this.totalRecords;
    }

    setGridSize(gridSize: number) {
        this.gridSize = gridSize;
    }

    getDataRecords(): string[][] {
        return this.dataRecords;
    }

}
