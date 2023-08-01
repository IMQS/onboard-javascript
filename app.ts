interface GridData {
    [key: string]: any;
  }
    
  interface ColumnName {
    name: string;
  }
   
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let totalItems = 0;
  let data: GridData[] = [];
  let columnNames: ColumnName[] = [];
  
   
  
  $(document).ready(() => {
    fetchRecordCount();
    fetchColumns();
    fetchRecords();
    setupControls();
  });
  
   
  
  function fetchRecordCount() {
    $.ajax({
      url: 'http://localhost:2050/recordCount',
      method: 'GET',
      success: (response: number) => {
        totalItems = response;
        renderGrid();
        console.log(response);
            
      },
      error: () => {
        console.error('Failed to fetch record count');
      }
    });
  }
  
  function fetchColumns() {
    $.ajax({
      url: 'http://localhost:2050/columns',
      method: 'GET',
      success: (response) => {
        let res = JSON.parse(response)
        columnNames = res.map((columnName: any) => ({ name: columnName }));
        data = new Array<GridData>(columnNames.length);
        renderGrid();
        // console.log(response);
        console.log(data);
      },
      error: () => {
        console.error('Failed to fetch columns');
      }
    });
  }
  
   
  
  function fetchRecords() {
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    $.ajax({
      url: `http://localhost:2050/records?from=${from}&to=${to}`,
      method: 'GET',
      success: (response) => {
        let res = JSON.parse(response)
        data = res.map((record: string | any[]) => {
          const obj: GridData = {};
          for (let i = 0; i < record.length; i++) {
            const columnName = columnNames[i].name;
            obj[columnName] = record[i];
          }
          return obj;
         
        });
        renderGrid()
        console.log(data)
      },
      error: () => {
        console.error('Failed to fetch records');
      }
    });
  }
  fetchRecords();
   
  
  function renderGrid() {
    const gridHeader = $('.grid-header');
    const gridBody = $('.grid-body');
    gridHeader.empty();
    gridBody.empty();
  
    if (data.length === 0) {
      gridHeader.text('No data found.');
      return;
    }
    const headers = columnNames.map((column) => column.name);
    headers.forEach((header) => {
      gridHeader.append(`<div>${header}</div>`);
    });
  
   
  
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
    for (let i = startIndex; i < endIndex; i++) {
      const row = data[i];
      const rowContent = headers.map((header) => `<div>${row[header]}</div>`).join('');
      gridBody.append(`<div>${rowContent}</div>`);
    }

    updatePageInfo();
  }
  
   
  
  function setupControls() {
    $('#prevBtn').on('click', () => {
      if (currentPage > 1) {
        currentPage--;
        fetchRecords();
      }
    });
  
   
  
    $('#nextBtn').on('click', () => {
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);
      if (currentPage < totalPages) {
        currentPage++;
        fetchRecords();
      }
    });
  }
  
   
  
  function updatePageInfo() {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const pageInfo = `Page ${currentPage} of ${totalPages}`;
    $('#pageInfo').text(pageInfo);
  }

