export class ApiService{

    private url: string;
    private columnNames: string[] = [];
    private totalRecords: number;
    private dataRecords: string[][] = [[]];
    private topRecordIndex: number;
    private numberOfRecords: number;

    constructor(numberOfRecords: number){

        this.url = 'http://localhost:2050';
        this.totalRecords = 0;
        this.topRecordIndex = 0;
        this.numberOfRecords = numberOfRecords;
        $.ajax({"url": this.url + '/columns',
                "success" : data => {
                    this.columnNames = JSON.parse(data);
                },
                "async" : false
        });


        $.ajax({"url": this.url + '/recordCount',
                "success" : data => {
                    this.totalRecords = Number(data);
                },
                "async" : false
        });

        this.getCurrentRecords();
    }

    public previous(): void{
        this.topRecordIndex = this.topRecordIndex - this.numberOfRecords;
        this.getCurrentRecords();
    }
    
    public next(): void{
        if(this.topRecordIndex + this.numberOfRecords < this.totalRecords){
            this.topRecordIndex = this.topRecordIndex + this.numberOfRecords;
            this.getCurrentRecords();
        }
    }

    public getCurrentRecords(){
        var toId: number;
        if(this.topRecordIndex + (this.numberOfRecords - 1) > (this.totalRecords-1)){
            toId = this.topRecordIndex + ((this.totalRecords - 1)  - this.topRecordIndex);
        } else if(this.topRecordIndex < 0){
            this.topRecordIndex = 0;
            toId = this.topRecordIndex + (this.numberOfRecords - 1);
        } else {
            toId = this.topRecordIndex + (this.numberOfRecords - 1);
        }
        $.ajax({"url": this.url + '/records',
                "data": {
                    "from" : this.topRecordIndex.toString(),
                    "to" : toId.toString()
                },
                "success" : data => {
                    this.dataRecords = JSON.parse(data);
                },
                "error": function(e) {
                    console.log(e);
                    alert('Error occured');
                },
                "async" : false
        });
    }

    public getRecords(id: string) {
        this.topRecordIndex = Number(id);
        var toId: number;
        if(this.topRecordIndex + (this.numberOfRecords - 1) > (this.totalRecords-1)){
            toId = this.topRecordIndex + ((this.totalRecords - 1) - this.topRecordIndex);
        } else if(this.topRecordIndex < 0){
            this.topRecordIndex = 0;
            toId = this.topRecordIndex + (this.numberOfRecords - 1);
        } else {
            toId = this.topRecordIndex + (this.numberOfRecords - 1);
        }
        $.ajax({"url": this.url + '/records',
                "data": {
                    "from" : this.topRecordIndex.toString(),
                    "to" : toId.toString()
                },
                "success" : data => {
                    this.dataRecords = JSON.parse(data);
                },
                "error": function(e) {
                    console.log(e);
                    alert('Error occured');
                },
                "async" : false
        });
    }

    public getColumnNames() : string[] {
        return this.columnNames;
    }

    public getTotalRecords(): number {
        return this.totalRecords;
    }

    public setNumberOfRecords(numberOfRecords: number) {
        this.numberOfRecords = numberOfRecords;
    }

    public getDataRecords() : string[][] {
        return this.dataRecords;
    }

}