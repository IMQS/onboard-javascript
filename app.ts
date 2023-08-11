
async function fetchRecordCount(): Promise<number> {
  try {
    const recordCount = await fetch(`http://192.168.4.133:2050/recordCount`);
   
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
  fetch("http://192.168.4.133:2050/columns")
    .then((response: Response) => {

      return response.json() as Promise<string[]>;
    })
    .then((columns: string[]) => {
      const colArray = columns;
      console.log(colArray);

      for (let c = 0; c < colArray.length; c++) {
        $(".head").append(`<th>${colArray[c]}</th>`);
      }
    })

}

fetchColumns();

async function fetchRecords(): Promise<any[][]> {
  try {
  let count: number = await fetchRecordCount() - 1;
  const response = await fetch(`http://192.168.4.133:2050/records?from=0&to=35`);

      if (!response.ok) {
        throw new Error("Sorry, there's a problem in the network");
      }
      const records = await response.json();
      return records;
  
      
    }catch(error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  }
  




fetchRecords()

async function displayRecords(): Promise<void> {
try{
  const recArray: any[][] = await fetchRecords();

  for (let r = 0; r <35; r++) {
    $("tbody").append(`<tr class="row"></tr>`);
    const lastRow = $(".row:last"); 
    for (let i = 0; i < recArray[r].length; i++) {
      lastRow.append(`<td>${recArray[r][i]}</td>`);
     
      
    } 
  }
}catch(error){
  console.error("Error displaying records:", error);
}
}
displayRecords()



async function rightArrow(): Promise<void> {
  let count: number = await fetchRecordCount() - 1;
  console.log(count);
  const firstRow = document.querySelector("#recordsTable tbody");
  console.log(firstRow)
  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
    console.log("First Record:", firstRecord[0]);


    const firstID = parseFloat(firstRecord[0]);
    console.log(firstID)

    if (0 <= firstID && firstID <= (count - 35)) {
      let clearTable = document.querySelector('tbody') as HTMLTableSectionElement | null;
      if (clearTable) {
        clearTable.innerHTML = "";

        let firstRecord = + firstID + 35
        let lastRecord = + firstRecord + 34

        fetch(`http://192.168.4.133:2050/records?from=${firstRecord}&to=${lastRecord}`)
          .then((response: Response) => {

            if (!response.ok) {
              throw new Error("Sorry, there's a problem in the network");
            }
            return response.json() as Promise<any[]>;
          })
          .then((records: any[]) => {
            const recArray = records;
            console.log(recArray);

            for (let r = 0; r <35; r++) {
              $("tbody").append(`<tr class="row"></tr>`);
              const lastRow = $(".row:last"); 
              for (let i = 0; i < recArray[r].length; i++) {
                lastRow.append(`<td>${recArray[r][i]}</td>`);
               
                
              } 
            }
          })
          .catch((error) => {
            console.error("Error fetching records:", error);
          });

      }
    }
  }
}

async function leftArrow(): Promise<void> {
  let count: number = await fetchRecordCount() - 1;
  console.log(count);
  const firstRow = document.querySelector("#recordsTable tbody");
  console.log(firstRow)
  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
   


    const firstID = parseFloat(firstRecord[0]);
    

    if (35 <= firstID && firstID <= (count)) {
      let clearTable = document.querySelector('tbody') as HTMLTableSectionElement | null;
      if (clearTable) {
        clearTable.innerHTML = "";

        let firstRecord = firstID - 35
       
        let lastRecord =firstRecord + 34
      
        

        fetch(`http://192.168.4.133:2050/records?from=${firstRecord}&to=${lastRecord}`)
          .then((response: Response) => {

            if (!response.ok) {
              throw new Error("Sorry, there's a problem in the network");
            }
            return response.json() as Promise<any[]>;
          })
          .then((records: any[]) => {
            const recArray = records;
            console.log(recArray);

            for (let r = 0; r <35; r++) {
              $("tbody").append(`<tr class="row"></tr>`);
              const lastRow = $(".row:last"); 
              for (let i = 0; i < recArray[r].length; i++) {
                lastRow.append(`<td>${recArray[r][i]}</td>`);
               
                
              } 
            }
          })
          .catch((error) => {
            console.error("Error fetching records:", error);
          });

      }
    }
  }
}




$('#searchInput').on('keyup',async () => {
  const inputValue = $('#searchInput').val() as string;
  console.log(inputValue);
  

  if(!inputValue.length){
    displayRecords()
  }
  const recArray: any[] = await fetchRecords();
  

  let filter = recArray.filter((item)=>{
    for (let i = 0; i < item.length; i++) {
      if (item[i].toLowerCase().includes(inputValue.toLowerCase())) {
        return true; 
       
      }
      
    }
    return false; 
    });
    const tbody = $("tbody");
    tbody.empty(); 
  
    for (let r = 0; r < 35 && r < filter.length; r++) {
      const row = $('<tr class="row"></tr>');
      for (let i = 0; i < filter[r].length; i++) {
        row.append(`<td>${filter[r][i]}</td>`);
      }
      tbody.append(row);
    }
  
  })

  
  
  
  
  
  
  
  
  

 
  
  
 




