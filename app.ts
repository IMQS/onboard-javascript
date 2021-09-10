class ApiService{

    private url = 'http://localhost:2050';
    private columnNames = [];
    private numberOfRecords = 0;
    private dataRecords= [[]];
    private topRecordIndex = 0;

    constructor(){
        $(".myGrid").css({"display": "grid",
        "width": "100%",
        "height": "100%",
        "text-align": "center"});
        $.get(this.url + '/columns', (data, success) => {
            //Need to handle different responses
            // if(success){

            // }
            this.columnNames = JSON.parse(data);
            this.populateHeaders();
        });

        $.get(this.url + '/recordCount', data => {
            this.numberOfRecords = data;
        });

        this.getRecords();

        var previousButton = $('<button id="prev">Previous</button>');
        $(".buttons").append(previousButton);

        var nextButton = $('<button id="next">Next</button>');
        $(".buttons").append(nextButton);
    }

    public next(): void{
        if(this.topRecordIndex + 40 <=  this.numberOfRecords - 40){
            this.topRecordIndex = this.topRecordIndex + 40;
            this.getRecords();
        }
    }

    public previous(): void{
        if(this.topRecordIndex - 40 >= 0){
            this.topRecordIndex = this.topRecordIndex - 40;
            this.getRecords();
        }
    }    

    public populateHeaders(): void{
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
        $(".grid-header").css({ "border": "1px solid #ddd"});
    }

    public populateRecords(): void{
        var n = this.dataRecords.length;
        $(".grid-item").remove();
        for (var i = 0; i < n; i++) {
            let rowArr = this.dataRecords[i]; 
            for (var j = 0; j < rowArr.length; j++) {
                var item = document.createElement("div");
                item.setAttribute("class", "grid-item");
                item.innerText = rowArr[j];
                $(".myGrid").append(item);
            }
        }
        $(".grid-item").css({ "border": "1px solid #ddd"});
    }

    private getRecords(){
        $.get(this.url + '/records', {
            from : this.topRecordIndex.toString(),
            to : (this.topRecordIndex + 40).toString()
         },
         data => {
            this.dataRecords = JSON.parse(data);
            this.populateRecords();
         });
    }


}
window.onload = () => { 
    $("*").css({"box-sizing": "border-box","margin": "0","padding": "0"});
    $("body").css({"width": "100vw",
                "height": "100vh",
                "overflow": "hidden"});
    $(".parentContainer").css({"display": "grid",
    "width": "100%",
    "height": "100%"});
    $(".parentContainer").append('<div class="myGrid"></div>');
    $(".parentContainer").append('<div class="buttons"></div>');
    $(".buttons").css({"width": "100%",
                "height": "100%"});
    let apiService = new ApiService();
    $("#next").on("click", function() {
        apiService.next();
    });
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
    $("#prev").on("click", function() {
        apiService.previous();
    });
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
}