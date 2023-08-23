import { ajax, css } from "jquery";
var firstNumber: number = 0;
var lastNumber: number;
var inputValue: number | null = null;
var calculatedRows: number | null = null;

async function fetchRecordCount(): Promise<number> {
  try {
    const recordCount = await fetch(`http://localhost:2050/recordCount`);
    if (!recordCount.ok) {
      throw new Error('Failed to fetch record count');
    }
    const data = await recordCount.json()
    return data;
  } catch (error) {
    console.error('Error fetching the record count:', error);
    throw error;
  }
}

function fetchColumns(): void {
  fetch("http://localhost:2050/columns")
    .then((response: Response) => {
      return response.json() as Promise<string[]>;
    })
    .then((columns: string[]) => {
      const colArray = columns;

      for (let c = 0; c < colArray.length; c++) {
        $(".head").append(`<th>${colArray[c]}</th>`);
      }
    })
}
fetchColumns()

async function adjustRowsByScreenHeight(): Promise<number> {
 
  let tableBody = (document.querySelector('.tableRecords tbody') as HTMLElement)?.clientHeight;
  let rowHeight = 50;
  let maxRows = Math.floor(tableBody / rowHeight);
  return maxRows;

}

let resizeTimeout: number;
$(window).on('resize', async () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
     $('#loader').show()
    calculatedRows = await adjustRowsByScreenHeight();
   
    if (inputValue !== null) {
      await updateRecordsAndResize(inputValue);
    }
     await displayRecords()
     $('#loader').hide();
   
  }, 500);
  })

async function fetchRecords(from: number, to: number): Promise<any[]> {

  const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
  if (!response.ok) {
    throw new Error("Sorry, there's a problem with the network");
  }

  return response.json();
}

async function displayRecords(): Promise<void> {
  try {
    $('#loader').show()
    calculatedRows = await adjustRowsByScreenHeight();
  
    
    const inputValue = $('#searchInput').val() as number;
    if (!lastNumber) {
      lastNumber = firstNumber + (calculatedRows - 1);
    }
    if (firstNumber < 0 ) {
      firstNumber = 0;
    }
    
    if (lastNumber >= 999999) {
      lastNumber = 999999;
      firstNumber = lastNumber - (calculatedRows-1)
     
    }else{
      lastNumber = firstNumber + (calculatedRows - 1);
    } 
    console.log(firstNumber,lastNumber)
    const records = await fetchRecords(firstNumber, lastNumber);
    const tbody = $("tbody");
    tbody.empty();
    for (let r = 0; r < records.length; r++) {
      $("tbody").append(`<tr class="row"></tr>`);
      const lastRow = $(".row:last");
      for (let i = 0; i < records[r].length; i++) {
        lastRow.append(`<td>${records[r][i]}</td>`);
      } 
      if(records[r].includes(inputValue)){
      
      lastRow.css('background-color', '#DDC0B4'); 
      
      }
      tbody.append(lastRow);
    $('#page').empty();
    $('#page').append(`Showing record: ${firstNumber} - ${lastNumber}`);
    $('#loader').hide()
    }
  } catch (error) {
    console.error("Error displaying records:", error);
  }
}
displayRecords()

async function updateRecordsAndResize(inputValue: number) {
  const count: number = await fetchRecordCount() - 1;
  if (inputValue < 0 || inputValue > count) {
    $('.modal').css('display','block')
    $('.modal-content').append(`<p>${inputValue} is not a number within the range.Please try a different number</p>`)
    $('#searchInput').val('');
    return;
  }
  calculatedRows = await adjustRowsByScreenHeight(); 
  const quarterRange = Math.floor(calculatedRows / 2);
  firstNumber = Math.max(0, inputValue - quarterRange);
  lastNumber = Math.min(count, firstNumber + (calculatedRows - 1));
  await displayRecords();
}

$('#closeModalBtn').on("click", () => {
  $('.modal').css('display','none')
});

$('.btnSearch').on('click', async (event: any) => {
  event.preventDefault();
  inputValue = $('#searchInput').val() as number;
  await updateRecordsAndResize(inputValue);
});

async function rightArrow(): Promise<void> {
  $('#searchInput').val('');
  const lastRow = document.querySelector("#recordsTable tbody .row:last-child");
  let count: number = await fetchRecordCount() - 1;
  if (lastRow) {
    const cells = lastRow.querySelectorAll("td");
    const lastRecord: string[] = [];
    cells.forEach((cell) => {
      lastRecord.push(cell.textContent || "");
    });
    const lastID = parseFloat(lastRecord[0]);
    if (0 <= lastID && lastID <= (count)) {
      
      const tbody = $("tbody");
      tbody.empty();
      firstNumber = lastID + 1;
      calculatedRows = await adjustRowsByScreenHeight();
      lastNumber = firstNumber + (calculatedRows - 1)
      await displayRecords();
    }else{
      $('.arrow-right').css('display','none')
    }
   
    
  }
}

async function leftArrow(): Promise<void> {
  $('#searchInput').val('');
  let count: number = await fetchRecordCount() - 1;
  const firstRow = document.querySelector("#recordsTable tbody .row:first-child");
  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
    const firstID = parseFloat(firstRecord[0]);
    const tbody = $("tbody");
    tbody.empty();
    const calculatedRows = await adjustRowsByScreenHeight();
    lastNumber = firstID - 1;
    firstNumber = lastNumber - (calculatedRows-1)
    await displayRecords();
    
}
}







































