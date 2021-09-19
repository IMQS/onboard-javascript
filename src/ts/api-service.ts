export class ApiService{

    private url: string;
    private columnNames: string[] = [];
    private totalRecords: number;
    private dataRecords: string[][] = [[]];
    private topRecordIndex: number;
    private gridSize: number;

    constructor(numberOfRecords: number){

        this.url = 'http://localhost:2050';
        this.totalRecords = 0;
        this.topRecordIndex = 0;
        this.gridSize = numberOfRecords;
        $.ajax({"url": this.url + '/columns',
                "success" : data => {
                    this.columnNames = JSON.parse(data);
                },
                //"async" : false
        });


        $.ajax({"url": this.url + '/recordCount',
                "success" : data => {
                    this.totalRecords = Number(data);
                },
                "async" : false
        });

        this.getCurrentRecords();
    }

    previous() {
        this.topRecordIndex = this.topRecordIndex - this.gridSize;
        return this.getCurrentRecords();
    }
    
    next() {
        this.topRecordIndex += this.gridSize;
        return this.getCurrentRecords();
    }

    getCurrentRecords(){
        var toId: number;
        if(this.topRecordIndex + (this.gridSize - 1) > (this.totalRecords-1)){
            toId = this.topRecordIndex + ((this.totalRecords - 1)  - this.topRecordIndex);
        } else if(this.topRecordIndex < 0){
            this.topRecordIndex = 0;
            toId = this.topRecordIndex + (this.gridSize - 1);
        } else {
            toId = this.topRecordIndex + (this.gridSize - 1);
        }
        return new Promise((resolve, reject) => {
            $.ajax({"url": this.url + '/records',
                "data": {
                    "from" : this.topRecordIndex.toString(),
                    "to" : toId.toString()
                },
                "success" : data => {
                    resolve(this.dataRecords = JSON.parse(data))
                },
                "error": (e) => {
                    reject(() => {
                        console.log(e);
                        alert('Error occured');
                    })
                }
            })
        })
    }

    searchRecord(id: string) {
        this.topRecordIndex = Number(id);
        var toId: number;
        if(this.topRecordIndex + (this.gridSize - 1) > (this.totalRecords-1)){
            toId = this.topRecordIndex + ((this.totalRecords - 1) - this.topRecordIndex);
        } else if(this.topRecordIndex < 0){
            this.topRecordIndex = 0;
            toId = this.topRecordIndex + (this.gridSize - 1);
        } else {
            toId = this.topRecordIndex + (this.gridSize - 1);
        }
        return new Promise((resolve, reject) => {
            $.ajax({"url": this.url + '/records',
                "data": {
                    "from" : this.topRecordIndex.toString(),
                    "to" : toId.toString()
                },
                "success" : data => {
                    resolve(this.dataRecords = JSON.parse(data));
                },
                "error": (e) => {
                    reject(() => {  console.log(e);
                                    alert('Error occured')
                    })
                },
            })
        })
    }

    getColumnNames() : string[] {
        return this.columnNames;
    }

    getTotalRecords(): number {
        return this.totalRecords;
    }

    setGridSize(gridSize: number) {
        this.gridSize = gridSize;
    }

    getDataRecords() : string[][] {
        return this.dataRecords;
    }

}