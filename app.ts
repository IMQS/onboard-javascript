const host = "http://localhost:2050";
let grid: Grid;
const initRecord = 0;
const rowLimit = 22;

class Grid {
    private host: string;
    private from: number;
    private to: number;
    private headers: string[] = [];
    private recordCount: number;

    // sets initial grid values.
    constructor(host: string, from: number, to: number) {
        this.host = host;
        this.setRecordCount();
        this.from = from;
        this.to = to;

        $.getJSON(host + "/columns", (data) => { })
            .done((headers) => {
                this.headers = headers;
                this.pageInit();

                // adds initial records to row objects to be added to grid on page load.
                this.drawBasicFromToGrid();
            });
    }

    // (re)initializes the page deafault values
    private pageInit(): void {
        $('#grid').empty();

        // add headers to row object to be added to the grid on initialization.
        this.drawRow("header", this.headers);
    }

    // iterates through records and adds them as rows to the grid
    private drawGrid(records: string[][]): void {
        for (let record of records) {
            this.drawRow("column", record);
        }
    }

    // draws individual rows by appending column objects to it and appending the row object to the grid.
    private drawRow(css_class: string, record: string[]): void {
        let $colu = $("<div />", {
            class: css_class
        });

        let row = this.newRow();

        for (let col of record) {
            row.append($colu.clone().text(col));
        }

        $("#grid").append(row.clone());
    }

    // the draw grid function where the 'from' and 'to' values are that of the class variables.
    private drawBasicFromToGrid(): void {
        $.getJSON(this.getRecordsUrl(this.from, this.to), (res) => {
        }).done((res) => {
            this.drawGrid(res);
        });
    }

    // sets the total amount of records on the repository.
    private setRecordCount(): void {
        $.getJSON(this.host + "/recordCount", (result) => {
        }).done(
            (count) => {
                this.recordCount = count;
            }
        );
    }

    // loads the higher id value set of records, than the current set of records, to display on the grid.
    public nextPage(): void {
        this.pageInit();
        this.from = this.to + 1;
        this.to = this.to + rowLimit + 1;

        if (this.from < this.recordCount && this.to >= this.recordCount) {
            this.to = this.to - this.recordCount;
            this.recordRollover(this.recordCount);
        }
        else {
            if (this.from >= this.recordCount && this.to > this.recordCount) {
                this.from = this.from - this.recordCount;
                this.to = this.to - this.recordCount;
            }

            this.drawBasicFromToGrid();
        }
    }

    // loads the lower id value set of records, than the current set of records, to display on the grid.
    public previousPage(): void {
        this.pageInit();
        this.from = this.from - rowLimit - 1;
        this.to = this.from + rowLimit;

        if (this.from < 0 && this.to >= 0) {
            this.from = this.from + this.recordCount;
            this.recordRollover(this.recordCount);
        }
        else {
            if (this.from == this.recordCount) {
                this.from = 0;
            }

            if (this.from < 0 && this.to < 0) {
                this.from = this.from + this.recordCount;
                this.to = this.to + this.recordCount;
            }

            this.drawBasicFromToGrid();
        }
    }

    // (re)instantiates the row object and returns it.
    private newRow() {
        return $("<div />", {
            class: 'row'
        });
    }

    // returns the string used for the record look up.
    private getRecordsUrl(from: number, to: number): string {
        return this.host + "/records?from=" + from + "&to=" + to;
    }

    // loads the record set that starts and ends on opposite sides of the repo reset. ie from = 999982, to = 4
    private recordRollover(recordCount: number): void {
        let records: string[][] = [];
        $.getJSON(this.getRecordsUrl(this.from, (recordCount - 1)), (res) => { })
            .done((res) => {
                records = res;
            }).then((todo) => {
                $.getJSON(this.getRecordsUrl(0, this.to), (res) => {
                })
                    .done((res) => {
                        for (let record of res) {
                            records.push(record);
                        }

                        this.drawGrid(records);
                    });
            });
    }
}

$(document).ready(function () {
    grid = new Grid(host, initRecord, initRecord + rowLimit);

    $("#prevbtn").click(
        () => {
            grid.previousPage();
        }
    );

    $("#nextbtn").click(
        () => {
            grid.nextPage();
        }
    );
});
