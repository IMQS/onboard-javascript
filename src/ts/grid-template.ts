export class GridTemplate {

    constructor(private columnNames: string[], private dataRecords: string[][]) {
        $(".myGrid").css({
            "display": "block",
            "width": "100%",
            "height": `${100 * 5 / 6}%`,
            "text-align": "center"
        });

        $(".controls").css({
            "display": "block",
            "width": "100%",
            "height": `${100 / 6}%`,
            "position": "fixed",
            "bottom": "0px"
        });

        const form = $('<form id="searchForm"></form>');

        form.append($('<label for="#search">Search: </label>'));
        form.append($('<input id="search" type="text" placeholder="Type in an ID"></input>'));
        form.append($('<input value="Submit" type="submit"></input>'));

        $(".controls").append($('<div class="form-grid"></div>'));
        $(".form-grid").append(form);
        $(".form-grid").css({
            "display": "flex",
            "width": "100%",
            "height": "50%",
            "align-items": "center",
            "background-color": "#4CAF50"
        });
        $("form").css({
            "display": "flex",
            "width": "100%",
            "justify-content": "center",
            "border-radius": "2px",
            "color": "white"
        });

        $(".controls").append($('<div class="control-grid"></div>'));
        $(".control-grid").css({
            "display": "block",
            "width": "100%",
            "height": "50%"
        });
        $(".control-grid").append($('<button id="prev">Previous</button>'));
        $("#prev").css({
            "display": "inline-block",
            "width": "50%",
            "height": "100%",
            "background-color": "#4CAF50",
            "border-radius": "2px",
            "color": "white",
            "text-decoration": "none",
        });
        $(".control-grid").append($('<button id="next">Next</button>'));
        $("#next").css({
            "display": "inline-block",
            "width": "50%",
            "height": "100%",
            "background-color": "#4CAF50",
            "border-radius": "2px",
            "color": "white",
            "text-decoration": "none"
        });
        this.populateHeaders();
        this.displayRecords();
    }

    displayRecords() {
        let n = this.dataRecords.length;
        $(".grid-item").remove();
        for (let i = 0; i < n; i++) {
            let rowArr = this.dataRecords[i];
            let searched = false;
            if (rowArr[0] === 'searched') {
                searched = true;
                rowArr.shift();
            }
            let odd = true;
            if (i % 2 === 0) { //Check for even index in the grid
                odd = false;
            }
            for (let column of rowArr) {
                const item = document.createElement("div");
                item.className = "grid-item";
                if (odd) {
                    item.className += " odd-item";
                }
                if (searched) {
                    item.className += " searched-item";
                }
                item.innerText = column;

                $(".myGrid").append(item);
            }
        }
        $(".grid-item").css({
            "border": "1px solid #A9A9A9",
            "display": "inline-block",
            //Equally divide column widths over the screen
            "width": `${100 / this.dataRecords[0].length}%`,
            //This causes text to overflow over cells but keeps the cell width equal for me. Had to be done.
            "white-space": "nowrap"
        });
        //Display odd records with a grey background
        $(".odd-item").css({ "background-color": "#D3D3D3" });
        $(".searched-item").css({ "background-color": "#FF4D4D" });
    }

    getDataRecords(): string[][] {
        return this.dataRecords;
    }

    setDataRecords(dataRecords: string[][]): void {
        this.dataRecords = dataRecords;
    }

    private populateHeaders(): void {
        let m = this.columnNames.length;
        for (let columnName of this.columnNames) {
            const item = document.createElement("div");
            item.className = "grid-header";
            item.innerText = columnName;
            $(".myGrid").append(item);
        }
        $(".grid-header").css({
            "color": "white",
            "display": "inline-block",
            "width": `${100 / m}%`,
            "border": "1px solid black",
            "background-color": "#4CAF50"
        });

    }

}