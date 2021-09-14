export class ApiService{

    private url: string;
    private columnNames: string[] = [];
    private numberOfRecords: number;
    private dataRecords: string[][] = [[]];
    private topRecordIndex: number;

    constructor(){

        //initialise properties
        this.url = 'http://localhost:2050';
        this.numberOfRecords = 0;
        this.topRecordIndex = 0;
        
        $.ajax({"url": this.url + '/columns',
                "success" : data => {
                    this.columnNames = JSON.parse(data);
                },
                "async" : false
        });


        $.ajax({"url": this.url + '/recordCount',
                "success" : data => {
                    this.numberOfRecords = data;
                },
                "async" : false
        });

        this.getRecords();
    }

    public previous(): void{
        if(this.topRecordIndex - 40 >= 0){
            this.topRecordIndex = this.topRecordIndex - 40;
            this.getRecords();
        }
    }
    
    public next(): void{
        if(this.topRecordIndex + 40 <=  this.numberOfRecords - 40){
            this.topRecordIndex = this.topRecordIndex + 40;
            this.getRecords();
        }
    }

    private getRecords(){
        $.ajax({"url": this.url + '/records',
                "data": {
                    "from" : this.topRecordIndex.toString(),
                    "to" : (this.topRecordIndex + 40).toString()
                },
                "success" : data => {
                    this.dataRecords = JSON.parse(data);
                },
                "async" : false
        });
    }

    public getColumnNames() : string[] {
        return this.columnNames;
    }

    public getDataRecords() : string[][] {
        return this.dataRecords;
    }
    
}