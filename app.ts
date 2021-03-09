var from:number, to:number, totalRecords:number;

window.onload = function()
{
  from = 0
  to = 9
  totalRecords = getTotalRecords();
  buttonPropertySet();
  createTable(from,to);
  populateTableData(from,to);
  fontResize();
}

$(window).on('ready resize', function() 
{
  fontResize();
});

function fontResize()
{
  $('td').css('font-size', $('td').width() + '%');
  $('td').css('font-size', $('td').height() + '%');
  $('th').css('font-size', $('th').width() + '%');
  $('th').css('font-size', $('th').height() + '%');
  $('button').css('font-size', $('button').width() + '%');
}

function buttonPropertySet()
{
  var previous = <HTMLInputElement> document.getElementById("previous");
  var previous5 = <HTMLInputElement> document.getElementById("previous5");
  var previous10 = <HTMLInputElement> document.getElementById("previous10");
  var previous100 = <HTMLInputElement> document.getElementById("previous100");
  var next = <HTMLInputElement> document.getElementById("next");
  var next5 = <HTMLInputElement> document.getElementById("next5");
  var next10 = <HTMLInputElement> document.getElementById("next10");
  var next100 = <HTMLInputElement> document.getElementById("next100");
  
  // disable previous buttons when out of range
  if(from < 9)
    previous.disabled=true;
  else
    previous.disabled=false;

  if(from < 49)  
    previous5.disabled=true;
  else
    previous5.disabled=false;

  if(from < 99)  
    previous10.disabled=true;
  else
    previous10.disabled=false;

  if(from < 999)  
    previous100.disabled=true;
  else
    previous100.disabled=false;

  // disable next buttons when out of range
  if(from >= (totalRecords - 10))
    next.disabled=true;
  else
    next.disabled=false;

  if(from >= (totalRecords - 50))
    next5.disabled=true;
  else
    next5.disabled=false;

  if(from >= (totalRecords - 100))
    next10.disabled=true;
  else
    next10.disabled=false;

  if(from >= (totalRecords - 1000))
    next100.disabled=true;
  else
    next100.disabled=false;
}

function getColumnHeaders()
{
    const HttpRequest = new XMLHttpRequest();
    const url='http://localhost:2050/columns';
    HttpRequest.open("GET", url, false);
    HttpRequest.send();

    const responseText = HttpRequest.responseText
    const JSONObject = JSON.parse(responseText);
    
    return JSONObject;
}

function getColumnData(from:number,to:number)
{
    const HttpRequest = new XMLHttpRequest();
    const url=`http://localhost:2050/records?from=${from}&to=${to}`;
    HttpRequest.open("GET", url, false);
    HttpRequest.send();

    const responseText = HttpRequest.responseText
    const JSONObject = JSON.parse(responseText);
    
    return JSONObject;
}

function getTotalRecords()
{
    const HttpRequest = new XMLHttpRequest();
    const url='http://localhost:2050//recordCount';
    HttpRequest.open("GET", url, false);
    HttpRequest.send();

    const responseText = HttpRequest.responseText
    
    return parseInt(responseText);
}

function populateTableData(from:number,to:number)
{
    var dataJSONObject = getColumnData(from,to);

    for (let index = 0; index < Object.keys(dataJSONObject).length; index++) 
    {
        for (let index2 = 0; index2 < Object.keys(dataJSONObject[index]).length; index2++) 
        {
            document.getElementById("row_" + index + "_cell_" + index2)!.innerHTML = dataJSONObject[index][index2]            
        }
       
    } 
}

function createTable(from:number, to:number)
{

    var headerJSONObject = getColumnHeaders();
    var dataJSONObject = getColumnData(0,9);

    const table = document.createElement("table");

   // insert a row and add headings to it
   const hrow = table.insertRow();
   for (let index = 0; index < Object.keys(headerJSONObject).length; index++) 
   {
        var newCell = hrow.insertCell(-1);
        newCell.outerHTML = `<th>${headerJSONObject[index]}</th>`;
        newCell.className = "tableCell";   
   }

   for (let index = 0; index < Object.keys(dataJSONObject).length; index++) 
   {
        const drow = table.insertRow(-1);

        for (let index2 = 0; index2 < Object.keys(dataJSONObject[index]).length; index2++) 
        {
            var newCell = drow.insertCell(-1);
            newCell.className = "tableCell";
            newCell.id = "row_" + index + "_cell_" + index2;
        }
   }

   // add table to div
   document.getElementById("tablediv")!.appendChild(table); // ** Check die code die ! suppress 'n "possibly null"

}

function previousButton(multiplier:number) 
{
    from -= (10 * multiplier);
    to -= (10 * multiplier);
    buttonPropertySet();
    populateTableData(from,to);
}

function nextButton(multiplier:number) 
{
    from += (10 * multiplier);
    to += (10 * multiplier);
    buttonPropertySet();
    populateTableData(from,to);
}

