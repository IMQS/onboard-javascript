// Interface to define the structure of grid data
interface GridData {
  [key: string]: any;
  }
  // Interface to define column names
  interface ColumnName {
  name: string;
  }
  // Class to manage data fetching and grid operations
  class ApiData {
  pageSize: number;
  currentPage: number = 1;
  data: GridData[] = [];
  totalItems: number = 0;
  columnNames: ColumnName[] = [];
  maxGridHeight: number = 0;
  firstVal : number = 0;
  lastVal!: number;
 
  
  
  constructor(pageSize: number) {
  this.pageSize = pageSize;
  
  }
 
  
  // Initialize method to set up the grid
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
  // Method to fetch total record count from the server
  async recordCount() {
  try {
  const response = await this.fetchData('http://localhost:2050/recordCount');
  this.totalItems = response;
  } catch (error) {
  console.error('Failed to fetch record count', error);
  throw error;
  }
  }
  //fectch column names
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
  //get records from API
  async fetchAndProcessRecords(from: number = this.firstVal, to: number =this.lastVal) {
  try {
  $('#spinner').show()
  $('#grid').hide()
  const response = await this.fetchData(`http://localhost:2050/records?from=${from}&to=${to}`);
  const res = JSON.parse(response);
  
  
  const processedData = res.map((record: any) => {
  const obj: GridData = {};
  for (let j = 0; j < this.columnNames.length && j < record.length; j++) {
  const columnName = this.columnNames[j].name;
  const columnValue = record[j];
  obj[columnName] = columnValue;
  }
  return obj;
  
  
  });
  $('#spinner').hide();
  $('#grid').show()
  return processedData;
  } catch (error) {
  console.error('Failed to fetch records', error);
  throw error;
  }
  }
  
  
  async fetchRecords() {
    const maxRange = this.totalItems - 1;
    const from = this.firstVal;
    let to = Math.min(from  + this.pageSize , maxRange);
    if (to >= maxRange) {
      this.currentPage = Math.floor(maxRange / this.pageSize) + 1; // Set currentPage to the last page
      to = maxRange;
    }
    try {
      const processedData = await this.fetchAndProcessRecords(from, to);
      this.data = processedData;
      this.displayRecords();
      this.updatePageInfo();
    } catch (error) {
      alert('failed to fetch records ');
    }
  }
  
  
  async searchRecords(searchValue: number) {
    try {
      const maxRange = this.totalItems - 1; // Maximum allowed Value

      if (searchValue >= 0 && searchValue <= maxRange) {
        const from = searchValue;
        const to = Math.min(from + this.pageSize, maxRange);
        const processedData = await this.fetchAndProcessRecords(from, to);
        this.data = processedData;
        this.currentPage = Math.floor(from / this.pageSize) 
        this.firstVal = from; // Set firstVal to searched value
        this.lastVal = from + this.pageSize ; // Calculate lastVal based on pageSize
        this.displayRecords();
        this.updatePageInfo();
      } else {
        alert('Please enter values in the range (0-999999)');
      }
    } catch (error) {
      alert('Failed to fetch records');
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
    const newFirstVal = this.firstVal + delta * this.pageSize;
    if (newFirstVal >= 0 && newFirstVal <= this.totalItems - 1) {
      this.firstVal = newFirstVal;
      this.lastVal = this.firstVal + this.pageSize - 1;
      this.currentPage = Math.floor(this.firstVal / this.pageSize) + 1;
      this.fetchRecords();
    }
  }
  
  
  private handleResize = () => {
    const newWindowHeight = Math.floor($(window).innerHeight() as number);
    const newGridSize = Math.floor((newWindowHeight * gridRatio) / rowHeight) - 1;
  
    if (newGridSize >= 0) {
      const oldPageSize = this.pageSize;
      const totalPages = Math.floor(this.totalItems / oldPageSize);
      const newPageSize = newGridSize;
  
      const newPageNumber = Math.max(1, Math.floor(this.firstVal / oldPageSize) + 1); // Ensure newPageNumber is at least 1
  
      let newFirstValueIndex = this.firstVal;
  
      // Adjust firstVal for the first page and the last page
      if ( newFirstValueIndex + newPageSize > this.totalItems) {
        newFirstValueIndex = Math.max(0, this.totalItems - newPageSize);
      }else if(newPageNumber === 1){
        newFirstValueIndex=  0
      }
  
      // Update firstVal, lastVal, and page size
      this.pageSize = newPageSize;
      this.firstVal = newFirstValueIndex;
      this.lastVal = newFirstValueIndex + newPageSize - 1;
  
      // Fetch records, update page info, and adjust grid height
      this.fetchRecords();
      this.updatePageInfo();
      this.adjustGridHeight();
    }
  }
  
  
  private displayRecords = () => {
  const gridTemplate = new GridTemplate(this.columnNames, this.data);
  gridTemplate.displayRecords();
  this.updatePageInfo();
  };
  
  
  updatePageInfo() {
    const totalPages = Math.floor(this.totalItems / this.pageSize);
    const pageInfo = `Page ${this.currentPage} of ${totalPages}`;
    const from = this.firstVal;
    this.lastVal = from + this.pageSize;
    const to = this.lastVal;  
    $('#pageInfo').text(`${pageInfo}`);
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
  
  //dispplay records in a grid in table format 
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
  // Wait for the document to be ready
  $(document).ready(() => {
  const windowHeight = Math.floor($(window).innerHeight() as number);
  const initialGridSize = Math.floor((windowHeight * gridRatio) / rowHeight) - 1;
  const apidata = new ApiData(initialGridSize);
  // Set up search button click handler
  $('#searchBtn').on('click', () => {
  const from = parseInt($('#fromInput').val() as string);
  const pageSize = apidata.pageSize;
  console.log(pageSize);
  const maxRange = apidata.totalItems - 1;
  if (!isNaN(from) && from >= 0 && from <= maxRange) {
  let to = Math.min(from + pageSize , maxRange);
  let adjustedFrom = from;
  if (adjustedFrom  + pageSize > maxRange) {
  adjustedFrom = Math.max(0, maxRange - pageSize);
  to = maxRange;
  }
  apidata.searchRecords(adjustedFrom);
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
  // Initialize the grid
  apidata.initialize();
  const overlay = $('<div id="overlay"></div>');
  $('body').append(overlay);
  });
  
  
  
