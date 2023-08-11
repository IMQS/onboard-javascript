// Define an interface for the grid data, allowing any string keys and any values.
interface GridData {
    [key: string]: any;
  }
  
  // Define an interface for column names 
  interface ColumnName {
    name: string;
  }
  
  // Constants and variables used for pages  and data storage.

  const PAGE_SIZE = 10;
  let currentPage = 1;
  let totalItems = 0;
  let data: GridData[] = [];
  let columnNames: ColumnName[] = [];
  
  // Entry point after the DOM has loaded.
 
  $(document).ready(() => {
    fetchRecordCount(); // Fetch the total number of records.
    fetchColumns(); // Fetch the column names for the grid.
    fetchRecords(); // Fetch the initial records to render the grid.
    setupControls(); // Set up page controls with event handlers.
    
  });
  
  // Fetch the total number of records.
  function fetchRecordCount() {
 // Show the spinner before making the  request  and hide the input elements
 $('#spinner').show();
 $('.top').hide();


    $.ajax({
      url: 'http://localhost:2050/recordCount',
      method: 'GET',
      success: (response: number) => {
        totalItems = response;
        // console.log(response); 
      },
      error: () => {
        console.error('Failed to fetch record count');
      },
      complete: () => {
        // Hide the spinner after the AJAX request is completed
        $('#spinner').hide();
        $('.top').show();
      }
    });
  }
  
  // Fetch the column names for the grid.
  function fetchColumns() {
    $('#spinner').show();
    $('.top').hide();

    $.ajax({
      url: 'http://localhost:2050/columns',
      method: 'GET',
      success: (response) => {
        let res = JSON.parse(response);
        // Convert the column names to ColumnName objects and store in columnNames array.
        columnNames = res.map((columnName: any) => ({ name: columnName }));
        data = new Array<GridData>(columnNames.length); // Initialize the data array with the number of columns.
      
      },
      
      error: () => {
        console.error('Failed to fetch columns');
      },
      complete: () => {
        // Hide the spinner after the AJAX request is completed
        $('#spinner').hide();
        $('.top').show();
      }
    });
  }
  
  function fetchRecords() {
   
    $('#spinner').show();
    $('.top').hide();

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    $.ajax({
      url: `http://localhost:2050/records?from=${from}&to=${to}`,
      method: 'GET',
      success: (response) => {
        let res = JSON.parse(response);
  
        data = []; // Reset the data array for the current page
        for (let i = 0; i < res.length; i++) {
          const record = res[i];
          if (Array.isArray(record)) { // Ensure the record is an array
            const obj: GridData = {};
            for (let j = 0; j < columnNames.length && j < record.length; j++) {
              const columnName = columnNames[j].name;
              const columnValue = record[j];
              obj[columnName] = columnValue; // Map column names to their corresponding values.
            }
            data.push(obj); // Add the row to the data array
          } else {
            console.error(`Invalid record format at index ${i}`);
          }
        }
  
        console.table(data);
        createGrid(); 
      },
      error: () => {
        console.error('Failed to fetch records');
      },
      complete:() =>{
        $('#spinner').hide();
        $('.top').show();
      }
    });
  }
  // update grid to display search by ID items 
  function updateGrid() {
    $('#spinner').show();
    $('.top').hide();
    const fromVal = $('#searchInputFrom').val();
    const toVal = $('#searchInputTo').val();
  
    if (typeof fromVal === 'string' && typeof toVal === 'string') {
      const from = parseInt(fromVal, 10);
      const to = parseInt(toVal, 10);
  
      if (!isNaN(from) && !isNaN(to)) {
        $.ajax({
          url: `http://localhost:2050/records?from=${from}&to=${to}`,
          method: 'GET',
          success: (response) => {
            let newData = JSON.parse(response);
            console.table(newData);
            if (Array.isArray(newData)) {
              data = [];
              for (let i = 0; i < newData.length; i++) {
                const record = newData[i];
                if (Array.isArray(record)) { 
                  const obj: GridData = {};
                  for (let j = 0; j < columnNames.length && j < record.length; j++) {
                    const columnName = columnNames[j].name;
                    const columnValue = record[j];
                    obj[columnName] = columnValue; // Map column names to their corresponding values.
                  }
                  data.push(obj); 
                } else {
                  console.error(`Invalid record format at index ${i}`);
                }
              }
              createGrid(); // Update the grid with the new data
              console.log(data);

            } else {
              console.warn('Invalid response format. Unexpected output .');
            }
          },
          error: () => {
            console.error('Failed to fetch records');
            alert('Someone needs to go back to the creche!');
          },
          complete: () => {
            $('#spinner').hide(); 
            $('.top').show();
          }
        });
      }
    }
  }
  
  
  
  // Render the grid with the fetched data.
  function createGrid() {
    const gridElement = document.getElementById('grid');
    if (gridElement) {
      gridElement.innerHTML = ''; // Clear the existing grid .
  
      // Create table element
      const table = document.createElement('table');
  
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      columnNames.forEach((column) => {
        const th = document.createElement('th');
        th.textContent = column.name;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Create table body
      const tbody = document.createElement('tbody');
      data.forEach((row) => {
        const tr = document.createElement('tr');
        columnNames.forEach((column) => {
          const td = document.createElement('td');
          td.textContent = row[column.name];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
  
      // Append the table to the grid element
      gridElement.appendChild(table);
    }
    updatePageInfo();
    
   
  }
  
  
  // Set up page controls with event handlers.
  function setupControls() {
    $('#prevBtn').on('click', () => {
      if (currentPage > 1) {
        currentPage--; // Go to the previous page.
        fetchRecords(); // Fetch records for the new page.
      }
    });
  
    $('#nextBtn').on('click', () => {
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      if (currentPage < totalPages) {
        currentPage++; // Go to the next page.
        fetchRecords(); // Fetch records for the new page.
      }
    });
  }
  
  // Update the page information display.
  function updatePageInfo() {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const pageInfo = `Page ${currentPage} of ${totalPages}`;
    $('#pageInfo').text(pageInfo); // Update the page information text.
  }

  // reload page 
  function pageReload(){
    location.reload();
  }
  