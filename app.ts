class table
{

  constructor()
  {
    this.from = 0;
    this._to = this.to;
  }

  private _from:number = 0;
  private _to:number;

  get from()
  {
    return this._from;
  }

  set from(from:number)
  { 
    let totalRecordsIndex:number = getTotalRecords() - 1;

    console.log("test");
    console.log(this._from);
    console.log(totalRecordsIndex);
    console.log(this.getNumberOfRows());

    if((from + this.getNumberOfRows()) > totalRecordsIndex)
      this._from = (totalRecordsIndex - this.getNumberOfRows());
    else if(from < 0 )
      this._from = 0;
    else
      this._from = from;

    this._to = this.to;

  }

  get to():number
  {
    let to:number;

    to = this._from + this.getNumberOfRows()

    if (to > getTotalRecords())
      return getTotalRecords() - 1;
    else
      return to;
  }


  //determine the amount of rows to add to the table based on the size on the window
  getNumberOfRows()
  { 
    let rows:number;

    //subtract - 1 to cater for header row.
    let height = (parseInt(((window.innerHeight-75)/30).toFixed(0)) - 1);
    let width = (parseInt(((window.innerWidth-75)/30).toFixed(0)) - 1);

    if (height < width)
      rows = height;
    else
      rows = width;

    if (rows < 0)
      return 0;
    else
      return rows; 
  
  }

  getTotalRecords()
  {
    const HttpRequest = new XMLHttpRequest();
    const url='http://localhost:2050//recordCount';
    HttpRequest.open("GET", url, false);
    HttpRequest.send();

    const responseText = HttpRequest.responseText
    
    return parseInt(responseText);
  }

  buildTable(from:number,to:number) 
  { 
    $("#dataTableBody").find("tr").remove();

    let tableBody = <HTMLTableSectionElement> document.getElementById("dataTableBody");  

    //make the ajax call to retrieve the records and build the table
    $.ajax({
      url: `http://localhost:2050/records?from=${from}&to=${to}`,
      dataType:'json',
      success:function(data) {

        $.each(data, function(row)
          {
            const dataRow = tableBody.insertRow(-1);
            $.each(data[row], function(cell)
              {
                const newCell = dataRow.insertCell(-1);
                newCell.innerHTML = data[row][cell];
              }
            )
          }
        )
      }
    });

    tableBody = <HTMLTableSectionElement> document.getElementById("dataTableBody");

    const dataRow = tableBody.insertRow(0);

    //make the ajax call to retrieve the records and build the table header
    $.ajax({
      url: `http://localhost:2050/columns`,
      dataType:'json',
      async:false,
      success:function(data) {
  
        //const dataRow = tableBody.insertRow(0);
        $.each(data, function(cell)
          {
            const newCell = dataRow.insertCell(-1);
            newCell.outerHTML = `<th>${data[cell]}</th>`;
             
          }
        )
      }
    });

    //call the button property set fucntion to set disable/enably buttons appropriately 
    buttonPropertySet();
  
  }

}

class utility
{
  timeout:number = 0;

  debounce(func: Function, wait:number){
    //let timeout:number;
  
    return (...args:any[]) => {
      const later = () => {
        clearTimeout(this.timeout);
        func(...args);
      };
  
      clearTimeout(this.timeout);
      this.timeout = setTimeout(later, wait);
    };
  };
}

const myTable = new table();
const myUtility = new utility();

window.onload = function()
{

  const request = myUtility.debounce(myTable.buildTable,250);

  request(myTable.from,myTable.to);

}

//on resize funtionalty to rebuild the table
$(window).on('resize', function() 
{
  // wrap the logic within a debounce funtion to prevent unnecesary calls. 
  let request = myUtility.debounce(function(){

    myTable.from = myTable.from;

    myTable.buildTable(myTable.from,myTable.to);

  },250);

  request();
}
);

function buttonPropertySet()
{
  let previous = <HTMLInputElement> document.getElementById("previous");
  let previous5 = <HTMLInputElement> document.getElementById("previous5");
  let previous10 = <HTMLInputElement> document.getElementById("previous10");
  let next = <HTMLInputElement> document.getElementById("next");
  let next5 = <HTMLInputElement> document.getElementById("next5");
  let next10 = <HTMLInputElement> document.getElementById("next10");

  let from = myTable.from;
  let totalRecords = getTotalRecords();

  // disable previous buttons when out of range
  if(from === 0)
  {
    previous.disabled=true;
    previous5.disabled = true;
    previous10.disabled = true;
  }
  else
  {
    previous.disabled=false;
    previous5.disabled=false;
    previous10.disabled=false;
  }

  // disable next buttons when out of range
  if(from + myTable.getNumberOfRows() === (totalRecords -1))
  {
    next.disabled=true;
    next5.disabled=true;
    next10.disabled=true;
  }
  else
  {
    next.disabled=false;
    next5.disabled=false;
    next10.disabled=false;
  }
}

//function to retrieve the total record count used when building the table
function getTotalRecords()
{
    const HttpRequest = new XMLHttpRequest();
    const url='http://localhost:2050//recordCount';
    HttpRequest.open("GET", url, false);
    HttpRequest.send();

    const responseText = HttpRequest.responseText
    
    return parseInt(responseText);
}

//previous button function that takes a multiplier indicating the amount of pages to page at a time
function previousButton(multiplier:number) 
{
  // wrap the logic within a debounce funtion to prevent unnecesary calls. 
  let request = myUtility.debounce(function(){
  
    myTable.from = myTable.from - ((myTable.getNumberOfRows() + 1) * multiplier);

    myTable.buildTable(myTable.from,myTable.to);

  },250);

  request();
  
}

//next button function that takes a multiplier indicating the amount of pages to page at a time
function nextButton(multiplier:number)
{
  // wrap the logic within a debounce funtion to prevent unnecesary calls. 
  let request = myUtility.debounce(function(){
  
    myTable.from = myTable.from + ((myTable.getNumberOfRows() + 1) * multiplier);

    myTable.buildTable(myTable.from,myTable.to);

  },250);

  request();

}

function jumpToButton()
{
  let inputElement = <HTMLInputElement> document.getElementById("jumpToValue");
  let from:number;

  // wrap the logic within a debounce funtion to prevent unnecesary calls. 
  let request = myUtility.debounce(function(){

    if (inputElement.value === "")
      from = 0;
    else 
      from = parseInt(inputElement.value);

    myTable.from = from;

    myTable.buildTable(myTable.from,myTable.to);

  },250);

  request();

}