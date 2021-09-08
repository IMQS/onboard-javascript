import axios from 'axios';

class ApiService{

    static columnNames: Array<string>;
    static numberOfRecords: number;
    static dataRecords: Array<Array<string>>;

    static setColumnNames(columns: Array<string>): void{
        this.columnNames = columns;
    }

    private columns = async (): Promise<any> => {
        return await axios.get('http://localhost:2050/columns');
    }

    static setRecordCount(recordCount: number): void{
        this.numberOfRecords = recordCount;
    }

    private recordCount = async (): Promise<any> => {
        return await axios.get('http://localhost:2050/recordCount');
    }
    
    static setRecords(records: Array<Array<string>>): void{
        this.dataRecords = records;
    }

    private records = async (fromId: string, toId: string): Promise<any> => {
        return await axios.get('http://localhost:2050/records',{
            params: {
                from: fromId,
                to: toId
            },
        });
    }

    constructor(){
        if($("#myTable")){
            var table = document.createElement('TABLE');
            $("#myTable").append(table);
            this.columns().then(function(response) {
                console.log(response.data)
                ApiService.setColumnNames(response.data);
                let headersArr = ApiService.columnNames;
                var m = headersArr.length;
        
                var tHead = document.createElement('THEAD');
                var tr = document.createElement('TR');
                
                
        
                for (var j = 0; j < m; j++) {
                var th = document.createElement('TH');
                th.innerText = headersArr[j];
                tr.appendChild(th);
                }
                tHead.appendChild(tr);
                table.appendChild(tHead);
            })
            this.recordCount().then(function(response) {
                console.log(response.data)
                ApiService.setRecordCount(response.data);
            })
            this.records('0', '20').then(function(response) {
                console.log(response.data)
                ApiService.setRecords(response.data);
                let dataArr = ApiService.dataRecords; 
                var n = dataArr.length;
                
                if (n > 0) {
                
                    for (var i = 0; i < n; i++) {
                    let rowArr = dataArr[i]; 
                    var tr = document.createElement('TR');
                    
                
                        for (var j = 0; j < rowArr.length; j++) {
                            var td = document.createElement('TD');
                            td.innerText = rowArr[j];
                            tr.appendChild(td);
                        }
                        table.appendChild(tr);
                    }          
                }
            })
        }
    }

}

window.onload = () => {new ApiService()};


