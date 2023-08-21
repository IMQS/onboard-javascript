interface GridData {
  [key: string]: any;
}

interface ColumnName {
  name: string;
}

class ApiData {
  pageSize: number;
  currentPage: number = 1;
  data: GridData[] = [];
  totalItems: number = 0;
  columnNames: ColumnName[] = [];
  maxGridHeight: number = 0;
 

  constructor(pageSize: number) {
    this.pageSize = pageSize;
  }

  async initialize() {
    try {
      this.adjustGridHeight();
      await this.recordCount(); 
      await this.fetchColumns();
      await this.fetchRecords();
      this.setupControls();
      
      
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  
  async recordCount() {
    try {
      const response = await this.fetchData('http://localhost:2050/recordCount');
      this.totalItems = response;
    } catch (error) {
      console.error('Failed to fetch record count', error);
      throw error;
    }
  }

  async fetchColumns() {
    try {
      const response = await this.fetchData('http://localhost:2050/columns');
      const res = JSON.parse(response);
      this.columnNames = res.map((columnName: any) => ({ name: columnName }));
      this.data = new Array<GridData>(this.columnNames.length);
    } catch (error) {
      console.error('Failed to fetch columns', error);
      throw error;
    }
  }

  async fetchRecords() {
    try {
      const from = (this.currentPage - 1) * this.pageSize;
      const to = from + this.pageSize;
      //  Display spinner while fetching records
    $('#spinner').show();
      const response = await this.fetchData(`http://localhost:2050/records?from=${from}&to=${to}`);
      const res = JSON.parse(response);
      this.data = res.map((record: any) => {
        const obj: GridData = {};
        for (let j = 0; j < this.columnNames.length && j < record.length; j++) {
          const columnName = this.columnNames[j].name;
          const columnValue = record[j];
          obj[columnName] = columnValue;
        }
        return obj;
      });
      $('#spinner').hide();
     this.displayRecords();
    } catch (error) {
      console.error('Failed to fetch records', error);
      throw error;
    }
  }
  adjustGridHeight() {
    const gridElement = document.getElementById('grid');
    const pageCntrl = $('.grid-controls').innerHeight();
    const screenHeight = $(window).innerHeight();
    if (gridElement && pageCntrl !== undefined && screenHeight !== undefined) {
      this.maxGridHeight = screenHeight - pageCntrl;
      gridElement.style.height = `${this.maxGridHeight}px`;
      gridElement.style.overflow = 'none';
    }
  }
  
  async searchRecords(from: number, to: number) {
    try {
      // Display spinner while fetching records
      $('#spinner').show();
      const response = await this.fetchData(`http://localhost:2050/records?from=${from}&to=${to}`);
      const res = JSON.parse(response);
      this.data = res.map((record: any) => {
        const obj: GridData = {};
        for (let j = 0; j < this.columnNames.length && j < record.length; j++) {
          const columnName = this.columnNames[j].name;
          const columnValue = record[j];
          obj[columnName] = columnValue;
        }
        
        return obj;
      });

      $('#spinner').hide();
      this.displayRecords();
      
     
    } catch (error) {
      console.error('Failed to fetch records', error);
      alert('please enter values in the range (0-999999)')
     return;
    }
  }

  private async fetchData(url: string): Promise<any> {
    try {
      $('#overlay').show();
      const response = await $.ajax({
        url,
        method: 'GET',
      });
      $('#overlay').hide();
      return response;
    } catch (error) {
      throw error;
    }
  }

  private setupControls() {
    $('#prevBtn').on('click', () => this.handlePageChange(-1));
    $('#nextBtn').on('click', () => this.handlePageChange(1));
    $(window).on('resize', debounce(this.handleResize, 350));
   
  }

  private handlePageChange(delta: number) {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.fetchRecords().then(this.displayRecords);
      this.updatePageInfo();
    
    }
  }

  private handleResize = () => {
    const newWindowHeight = Math.floor($(window).innerHeight() as number);
    const newGridSize = Math.floor((newWindowHeight * gridRatio) / rowHeight) - 1;
    if (newGridSize >= 0) {
      this.pageSize = newGridSize;
      // console.log(newGridSize);
      this.updatePageInfo();
      this.fetchRecords().then(this.displayRecords);
      this.adjustGridHeight();
    }else if (newGridSize > this.maxGridHeight){
      
    }

   
  };


  private displayRecords = () => {
    const gridTemplate = new GridTemplate(this.columnNames, this.data);
    gridTemplate.displayRecords();
    this.updatePageInfo();
    
  };
  

   updatePageInfo() {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    const pageInfo = `Page ${this.currentPage} of ${totalPages}`;
    const from = (this.currentPage - 1) * this.pageSize;
    const to = (this.currentPage)*(this.pageSize)
    $('#pageInfo').text(pageInfo);
    $('.records').text(`Showing records ${from} to ${to}`);
  }
  
}

class GridTemplate {
  private columnNames: ColumnName[] = [];
  private dataRecords: GridData[] = [];

  constructor(columnNames: ColumnName[], dataRecords: GridData[]) {
    this.columnNames = columnNames;
    this.dataRecords = dataRecords;
  }

  setDataRecords(dataRecords: GridData[]): void {
    this.dataRecords = dataRecords;
  }

 displayRecords(): void {
    const gridElement = document.getElementById('grid');
    if (gridElement) {
      gridElement.innerHTML = '';
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      this.columnNames.forEach((column) => {
        const th = document.createElement('th');
        th.textContent = column.name;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      this.dataRecords.forEach((row) => {
        const tr = document.createElement('tr');
        this.columnNames.forEach((column) => {
          const td = document.createElement('td');
          td.textContent = row[column.name];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      gridElement.appendChild(table);
      
    }
  }
 
}

const gridRatio = 0.45;
const rowHeight = 16;

function debounce<F extends (...args: any) => any>(func: F, waitFor: number) {
  let timeout: number;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, waitFor);
    });
  };
}

$(document).ready(() => {
  const windowHeight = Math.floor($(window).innerHeight() as number);
  const initialGridSize = Math.floor((windowHeight * gridRatio) / rowHeight) - 1;
  const apidata = new ApiData(initialGridSize); 
  
  $('#searchBtn').on('click', () => {
    const from = parseInt($('#fromInput').val() as string);
    const pageSize = apidata.pageSize;
    const maxRange = apidata.totalItems - 1;

    if (!isNaN(from) && from >= 0 && from <= maxRange) {
        let to = Math.min(from + pageSize - 1, maxRange);
        let adjustedFrom = from;
        if (adjustedFrom + pageSize > maxRange) {
            adjustedFrom = Math.max(0, maxRange - pageSize);
            to = maxRange;  
        }
      apidata.searchRecords(adjustedFrom, to);
    
       
    }else if (from < 0 || from > maxRange) {
      alert('please enter values in the range (0-999999)');
      return;
    }else if (isNaN(from)){
      alert('Please enter a numerical value ')
    }else{
      console.error('error')
    }
    
    $('#fromInput').val('') ;
  
});


  apidata.initialize();
  const overlay = $('<div id="overlay"></div>');
  $('body').append(overlay);
});


