export class GridTemplate {

    constructor(private columnNames: string[], private dataRecords: string[][]) {
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
            if (i % 2 === 0) { // Check for even index in the grid
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
            // Equally divide column widths over the screen
            "width": `${100 / this.dataRecords[0].length}%`,
        });
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
            "width": `${100 / m}%`,
        });

    }

}
