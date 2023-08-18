var firstNumber: number = 0;
console.log
var lastNumber: number;
console.log



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
fetchColumns();



async function adjustRowsByScreenHeight(): Promise<number> {
  $('#loader').show()
  const tableBody = document.querySelector('.tableRecords tbody') as HTMLElement;
  const rowHeight = 30
  const maxRows = Math.floor(tableBody.clientHeight / rowHeight);
  
  return maxRows;

}

async function fetchRecords(from: number, to: number): Promise<any[]> {

  const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
  if (!response.ok) {
    throw new Error("Sorry, there's a problem with the network");
  }

  return response.json();

}


$(window).on('resize', async (event: any) => {
  event.preventDefault()
  $('#page').empty();
  // const count: number = await fetchRecordCount() - 1;
  // const calculatedRows = await adjustRowsByScreenHeight();

  // console.log(firstNumber)
  // console.log(lastNumber)
  // if (firstNumber < 0) {
  //   firstNumber = 0;
  // }

  // if (lastNumber > count) {
  //   lastNumber = count;
  // } else {
  //   lastNumber = firstNumber + (calculatedRows-1);
  // }

  await displayRecords();

})

async function displayRecords(): Promise<void> {
  try {
    $('#loader').show()
    const calculatedRows = await adjustRowsByScreenHeight();
    const inputValue = $('#searchInput').val() as number;
  

    if (!lastNumber) {
      lastNumber = firstNumber + (calculatedRows - 1);
    }
    if (firstNumber < 0) {
      firstNumber = 0;
    }
    if (lastNumber >= 999999) {
      lastNumber = 999999;
    }else{
      lastNumber = firstNumber + (calculatedRows - 1);
    }

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
          console.log(records[r]);
          lastRow.css('background-color', '#DDC0B4'); 
        
        }
      tbody.append(lastRow);

    }
  
    $('#page').empty();
    $('#page').append(`Showing record: ${firstNumber} - ${lastNumber}`);
    $('#loader').hide()

  } catch (error) {
    console.error("Error displaying records:", error);
  }
}
displayRecords()


async function updateRecordsAndResize(inputValue: number) {
  const count: number = await fetchRecordCount() - 1;

  if (isNaN(inputValue) || inputValue > count) {
    alert(`${inputValue} is not a number within the range`);
    $('#searchInput').val('');
    return;
  }

  // Calculate a range of numbers around the inputValue
  const range = await adjustRowsByScreenHeight(); // Adjust this value to control the range size
  firstNumber = Math.max(0, inputValue - Math.floor(range / inputValue));
  console.log(firstNumber);

  lastNumber = Math.min(count, firstNumber + range - 1);
  console.log(lastNumber);
 
 

  await adjustRowsByScreenHeight();

  await displayRecords();
}


$('.btnSearch').on('click', async (event: any) => {
  event.preventDefault();
  const inputValue = $('#searchInput').val() as number;
  console.log(inputValue)


  await updateRecordsAndResize(inputValue);
});


async function rightArrow(): Promise<void> {
  const lastRow = document.querySelector("#recordsTable tbody .row:last-child");
  let count: number = await fetchRecordCount() - 1;


  if (lastRow) {
    const cells = lastRow.querySelectorAll("td");
    const lastRecord: string[] = [];
    cells.forEach((cell) => {
      lastRecord.push(cell.textContent || "");
    });
    const lastID = parseFloat(lastRecord[0]);
    console.log(lastID);

    if (0 <= lastID && lastID <= (count)) {
      const tbody = $("tbody");
      tbody.empty();

      firstNumber = lastID + 1;

      const calculatedRows = await adjustRowsByScreenHeight();

      lastNumber = firstNumber + (calculatedRows - 1)

      await adjustRowsByScreenHeight();
      await displayRecords();

    }

  }
}



async function leftArrow(): Promise<void> {

  let count: number = await fetchRecordCount() - 1;


  const firstRow = document.querySelector("#recordsTable tbody .row:first-child");

  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
    const firstID = parseFloat(firstRecord[0]);
    console.log(firstID)


    const tbody = $("tbody");
    tbody.empty();

    const calculatedRows = await adjustRowsByScreenHeight();
    console.log(calculatedRows);

    firstNumber = firstID - (calculatedRows + 1)
    console.log(firstRecord);


    lastNumber = firstNumber + (calculatedRows)
    console.log(lastNumber);

    await adjustRowsByScreenHeight();

    await displayRecords();
  }


}




































