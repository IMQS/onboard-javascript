export class GridTemplate {

    constructor(private columnNames: string[], private dataRecords: string[][]){
        $(".myGrid").css({"display": "grid",
        "width": "100%",
        "height": "100%",
        "text-align": "center"});

        var previousButton = $('<button id="prev">Previous</button>');
        $(".buttons").append(previousButton);
        $("#prev").css({"width": "50%",
            "height": "100%",
            "background-color": "#4CAF50",
            "border-radius": "2px",
            "color": "white",
            "text-align": "center",
            "text-decoration": "none",
            "display": "inline-block",
            "font-size": "16px",
        });

        var nextButton = $('<button id="next">Next</button>');
        $(".buttons").append(nextButton);
        $("#next").css({"width": "50%",
            "height": "100%",
            "background-color": "#4CAF50",
            "border-radius": "2px",
            "color": "white",
            "text-align": "center",
            "text-decoration": "none",
            "display": "inline-block",
            "font-size": "16px",
        });
        
        this.populateHeaders();
        this.displayRecords();
    }

    private populateHeaders(): void {
        var m = this.columnNames.length;
        var lengthOfColumns = new String("auto ");
        lengthOfColumns = lengthOfColumns.repeat(m);
        $(".myGrid").css({ "grid-template-columns": lengthOfColumns.toString()});
        for (var j = 0; j < m; j++) {
            var item = document.createElement("div");
            item.setAttribute("class", "grid-header");
            item.innerText = this.columnNames[j];
            $(".myGrid").append(item);
        }
        $(".grid-header").css({ "color": "white",
                            "border": "1px solid black",
                            "background-color": "#4CAF50"});
    }

    public displayRecords(): void {
        var n = this.dataRecords.length;
        $(".grid-item").remove();
        for (var i = 0; i < n; i++) {
            let rowArr = this.dataRecords[i]; 
            for (var j = 0; j < rowArr.length; j++) {
                var item = document.createElement("div") as HTMLDivElement;
                item.setAttribute("class", "grid-item");
                item.innerText = rowArr[j];
                $(".myGrid").append(item);
            }
        }
        $(".grid-item").css({ "border": "1px solid #ddd"});
    }

    public getDataRecords(): string[][] {
        return this.dataRecords;
    }

    public setDataRecords(dataRecords: string[][]): void {
        this.dataRecords = dataRecords;
    }
}