const host = "http://localhost:2050";
let grid: Grid;
const initRecord = 0;
const rowLimit = 22;

class Grid {
    from: number;
    to: number;
    headers: string[] = [];

    $row = $("<div />", {
        class: 'row'
    });

    $header = $("<div />", {
        class: 'header'
    });

    $column = $("<div />", {
        class: 'column'
    });

    //sets initial grid values.
    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;

        $.getJSON(host + "/columns", (data) => { })
            .done((headers) => {
                this.headers = headers;
                this.pageInit();

                //adds initial records to row objects to be added to grid on page load.
                $.getJSON(host + "/records?from=" + this.from + "&to=" + this.to, (data) => { })
                    .done((records) => {
                        this.drawGrid(records);
                    });
            });
    }

    //(re)initializes the page deafault values
    pageInit() {
        $('#grid').empty();
        this.$row.empty();
        this.$column.empty();

        //add headers to row object to be added to the grid on initialization.
        for (let col of this.headers) {
            this.$row.append(this.$header.clone().text(col));
        }

        $("#grid").append(this.$row.clone());
    }

    //iterates through records and adds them as rows to the grid
    drawGrid(records: string[][]) {
        for (let record of records) {
            this.$row.empty();

            for (let col of record) {
                this.$row.append(this.$column.clone().text(col));
            }

            $("#grid").append(this.$row.clone());
        }
    }

    //loads the higher id value set of records, than the current set of records, to display on the grid.
    nextPage() {
        this.pageInit();
        this.from = this.to + 1;
        this.to = this.to + rowLimit + 1;

        $.getJSON(host + "/recordCount", (result) => {
        }).done(
            (recordCount) => {
                if (this.from < recordCount && this.to >= recordCount) {
                    this.to = this.to - recordCount;
                    this.recordRollover(recordCount);
                }
                else {
                    if (this.from >= recordCount && this.to > recordCount) {
                        this.from = this.from - recordCount;
                        this.to = this.to - recordCount;
                    }

                    $.getJSON(host + "/records?from=" + this.from + "&to=" + this.to, (res) => {
                    }).done((res) => {
                        this.drawGrid(res);
                    });
                }
            });
    }

    //loads the lower id value set of records, than the current set of records, to display on the grid.
    previousPage() {
        this.pageInit();
        this.from = this.from - rowLimit - 1;
        this.to = this.from + rowLimit;

        $.getJSON(host + "/recordCount", (result) => {
        }).done(
            (recordCount) => {
                if (this.from < 0 && this.to >= 0) {
                    this.from = this.from + recordCount;
                    this.recordRollover(recordCount);
                }
                else {
                    if (this.from == recordCount) {
                        this.from = 0;
                    }

                    if (this.from < 0 && this.to < 0) {
                        this.from = this.from + recordCount;
                        this.to = this.to + recordCount;
                    }

                    $.getJSON(host + "/records?from=" + this.from + "&to=" + this.to, (res) => {
                    }).done(
                        (res) => {
                            this.drawGrid(res);
                        });
                }
            });
    }

    //loads the record set that starts and ends on opposite sides of the repo reset. ie from = 999982, to = 4
    private recordRollover(recordCount: number) {
        let records: string[][] = [];
        console.log("FROM: " + this.from + " to " + this.to);
        $.getJSON(host + "/records?from=" + this.from + "&to=" + (recordCount - 1), (res) => { })
            .done((res) => {
                records = res;
            }).then((todo) => {
                $.getJSON(host + "/records?from=" + 0 + "&to=" + this.to, (res) => {
                    console.log("GETS HERE");
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
    grid = new Grid(initRecord, initRecord + rowLimit);

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
