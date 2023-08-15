
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
    const response = await fetch(`http://192.168.4.133:2050/records?from=0&to=${count}`);
    if (!response.ok) {
      throw new Error("Sorry, there's a problem in the network");
    }
    const records = await response.json();
    return records;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
}
fetchRecords()

async function displayRecords(): Promise<void> {
  try {
    $('#loader').show()
    fetch(`http://192.168.4.133:2050/records?from=0&to=19`)
      .then((response: Response) => {

        if (!response.ok) {
          throw new Error("Sorry, there's a problem in the network");
        }
        return response.json() as Promise<any[]>;
      })
      .then((records: any[]) => {
        const recArray = records;
        $('#loader').hide()

        for (let r = 0; r < 20; r++) {
          $("tbody").append(`<tr class="row"></tr>`);
          const lastRow = $(".row:last");
          for (let i = 0; i < recArray[r].length; i++) {
            lastRow.append(`<td>${recArray[r][i]}</td>`);
          }
        }
        $('#page').empty()
        $('#page').append(`Showing record: 1 - 19`)
      })
  } catch (error) {
    console.error("Error displaying records:", error);
  }
}
displayRecords()



$('.btnSearch').on('click', async (event: any) => {
  event.preventDefault()
  console.log('hello')
  const inputValue = $('#searchInput').val() as number;
  if (isNaN(inputValue)) {
    alert(`${inputValue} is not a number`);
    $('#searchInput').val('')

  } else {

    const firstNumber = Math.floor(inputValue / 10) * 10;
    const lastNumber = firstNumber + 19
    const tbody = $("tbody");
    tbody.empty();
    $('#page').empty();
    try {
      $('#loader').show()
      fetch(`http://192.168.4.133:2050/records?from=${firstNumber}&to=${lastNumber}`)
        .then((response: Response) => {

          if (!response.ok) {
            throw new Error("Sorry, there's a problem in the network");
          }
          return response.json() as Promise<any[]>;
        })
        .then((records: any[]) => {
          const recArray = records;
          $('#loader').hide()

          for (let r = 0; r < 20; r++) {
            $("tbody").append(`<tr class="row"></tr>`);
            const lastRow = $(".row:last");
            for (let i = 0; i < recArray[r].length; i++) {
              lastRow.append(`<td>${recArray[r][i]}</td>`);
            }
          }
          $('#page').empty()
          $('#page').append(`Showing record: ${firstNumber} - ${lastNumber}`)
        })
    } catch (error) {
      console.error("Error displaying records:", error);
    }
  }
})



async function rightArrow(): Promise<void> {
  const firstRow = document.querySelector("#recordsTable tbody");
  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
    const firstID = parseFloat(firstRecord[0]);
    if (0 <= firstID) {
      let clearTable = document.querySelector('tbody') as HTMLTableSectionElement | null;
      if (clearTable) {
        clearTable.innerHTML = "";

        let firstRecord = + firstID + 20
        let lastRecord = + firstRecord + 19
        $('#page').empty()
        $('#page').append(`Showing record: ${firstRecord} - ${lastRecord}`)

        $('#loader').show()
        fetch(`http://192.168.4.133:2050/records?from=${firstRecord}&to=${lastRecord}`)
          .then((response: Response) => {

            if (!response.ok) {
              throw new Error("Sorry, there's a problem in the network");
            }
            return response.json() as Promise<any[]>;
          })
          .then((records: any[]) => {
            const recArray = records;
            $('#loader').hide()

            for (let r = 0; r < 20; r++) {
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
  let searchValue = $('#searchInput').val() as string
  let count: number = await fetchRecordCount() - 1;

  const firstRow = document.querySelector("#recordsTable tbody");

  if (firstRow) {
    const cells = firstRow.querySelectorAll("td");
    const firstRecord: string[] = [];
    cells.forEach((cell) => {
      firstRecord.push(cell.textContent || "");
    });
    const firstID = parseFloat(firstRecord[0]);
    if (20 <= firstID && firstID <= (count)) {
      let clearTable = document.querySelector('tbody') as HTMLTableSectionElement | null;
      if (clearTable) {
        clearTable.innerHTML = "";

        let firstRecord = firstID - 20

        let lastRecord = firstRecord + 19
        $('#page').empty()
        $('#page').append(`Showing record: ${firstRecord} - ${lastRecord}`)
        $('#loader').show()
        fetch(`http://192.168.4.133:2050/records?from=${firstRecord}&to=${lastRecord}`)
          .then((response: Response) => {

            if (!response.ok) {
              throw new Error("Sorry, there's a problem in the network");
            }
            return response.json() as Promise<any[]>;
          })
          .then((records: any[]) => {
            const recArray = records;
            $('#loader').hide()


            for (let r = 0; r < 20; r++) {
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
























