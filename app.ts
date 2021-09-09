class ApiService{

    private url: string = 'http://localhost:2050';
    private columnNames: Array<string> = [];
    private numberOfRecords: number = 0;
    private dataRecords: Array<Array<string>> = [];
    private topRecordIndex: number = 0;

    constructor(){

        if($("#myTable")){
            $("#myTable").append(document.createElement("table"));
            $("#myTable").css({"position": "relative", "overflow": "hidden"});
            $("table").css({'table-layout' : ' fixed ',
             'width' : '100%',
             'font-family': 'Arial, Helvetica, sans-serif',
             'border-collapse': 'collapse',
             'top' : '0',
             'bottom' : '0',
             'right' : '0',
             'left' : '0'});

            $.get(this.url + '/columns', data => {
               this.columnNames = JSON.parse(data);
               this.populateHeaders();
            });
    
            $.get(this.url + '/recordCount', data => {
                this.numberOfRecords = data;
             });

             this.getRecords();

            var nextButton = $('<button id="next">Next</button><br/>');
            $("body").append(nextButton);

            var previousButton = $('<button id="prev">Previous</button><br/>');
            $("body").append(previousButton);
        }
    }

    public next(): void{
        if(this.topRecordIndex + 41 < this.numberOfRecords - 41){
            this.topRecordIndex = this.topRecordIndex + 41;
            this.getRecords();
        }
    }

    public previous(): void{
        if(this.topRecordIndex - 41 >= 0){
            this.topRecordIndex = this.topRecordIndex - 41;
            this.getRecords();
        }
    }    

    public populateHeaders(): void{
        var m = this.columnNames.length;
        var tHead = document.createElement('THEAD');
        var tr = document.createElement('TR');

        for (var j = 0; j < m; j++) {
            var th = document.createElement('TH');
            th.innerText = this.columnNames[j];
            tr.appendChild(th);
        }
        tHead.appendChild(tr);
        $("th").css({"background-color":"#04AA6D"});
        $("table").append(tHead);
    }

    public populateRecords(): void{
        var n = this.dataRecords.length;
        if($("tbody").length == 0){
            $("table").append(document.createElement('TBODY'));
        } else{
            $("tbody").empty();            
        }
        
        for (var i = 0; i < n; i++) {
            let rowArr = this.dataRecords[i]; 
            var tr = document.createElement('TR');  
            for (var j = 0; j < rowArr.length; j++) {
                var td = document.createElement('TD');
                td.innerText = rowArr[j];
                tr.appendChild(td);
            }
            $("tbody").append(tr);
        }
        $("td").css({"border": "2px groove grey", "text-align": "center"});
        $("tr:nth-child(even)").css({"background-color":"#04AA6D"});
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
    $("*").css("box-sizing: border-box");
    $("body").css({"margin": "0","padding": "0"});
    let apiService = new ApiService();
    $("#next").on("click", function() {
        apiService.next();
    })
    $("#next").css({"bottom":"1%", "right":"6%", "position": "absolute",
        "background-color": "#4CAF50", /* Green */
        "border-radius": "2px",
        "color": "white",
        "text-align": "center",
        "text-decoration": "none",
        "display": "inline-block",
        "font-size": "16px",
      });

    $("#prev").on("click", function() {
        apiService.previous();
    })
    $("#prev").css({"bottom":"1%", "right":"11%", "position": "absolute",
        "background-color": "#4CAF50", /* Green */
        "border-radius": "2px",
        "color": "white",
        "text-align": "center",
        "text-decoration": "none",
        "display": "inline-block",
        "font-size": "16px",
    });
}