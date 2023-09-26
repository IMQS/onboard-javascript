//*** Controllers ***/

// Handles window resize events to update the view of the application.
class WindowResizeHandler {
    private debouncedUpdate: Function;
    private paginationManager: PaginationManager;


    /**
     * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
     * @param {StateManager} stateManager - State control for retrieving/updating application data.
     */
    constructor(
        private tableRenderer: TableRenderer,
        private stateManager: StateManager,
        paginationManager: PaginationManager
    ) {
        this.debouncedUpdate = this.debounce(this.updateAfterResize.bind(this), 350);
        this.paginationManager = paginationManager;

        // Attach event listener for window resize.
        this.setupEventListeners();
    }
  
    private setupEventListeners(): void {
        window.addEventListener('resize', () => this.handleResize());
    }
  
    handleResize() {
        console.log("Function #15 - Executing handleResize");
        this.debouncedUpdate();
    }
    
    /**
     * Debounce function to reduce the number of function calls while user is dragging the browser window.
     * It delays the processing of the event until the user has stopped resizing the window for a determined amount of time.
     */
    debounce(func: Function, delay: number): Function {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        return (...args: any[]) => {
            const later = () => {
                timeout = null;
                func(...args);
            };
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, delay);
        };
    }
  
    async updateAfterResize() {
      try {
        console.log("Update after resize");
        this.stateManager.adjustWindowSize();
        await this.stateManager.retrieveRecords();
        const records = this.stateManager.getRecords();
  
        if (records !== null) {
          this.tableRenderer.renderRecords(records);
        }
        this.paginationManager.updateButtonStates(); 
        
      } catch (error) {
        console.error(`Error in updateAfterResize: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  
  // Handles pagination and search functionalities for the application's table view.
  class PaginationManager {
    // DOM elements required for pagination and search.
    private prevButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;
    private searchButton: HTMLButtonElement;
    private mainHeading: HTMLElement;
    private filterInput: HTMLInputElement;
    private errorMessage: HTMLElement;
    

    /**
     * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
     * @param {StateManager} stateManager - State control for retrieving/updating application data.
     */
    constructor(private tableRenderer: TableRenderer, private stateManager: StateManager) {
        this.tableRenderer = tableRenderer;
        this.stateManager = stateManager;
  
        this.prevButton = document.getElementById("prevPage") as HTMLButtonElement;
        this.nextButton = document.getElementById("nextPage") as HTMLButtonElement;
        this.searchButton = document.getElementById('searchButton') as HTMLButtonElement;
        this.mainHeading = document.getElementById("main-heading") as HTMLElement;
        this.filterInput = document.getElementById('filterInput') as HTMLInputElement;
        this.errorMessage = document.getElementById('errorMessage') as HTMLElement;
        
        // Attach event listeners for buttons and other UI elements.
        this.setupEventListeners();
    }
    
    // Attaches event listeners to the relevant DOM elements to handle user interactions.
    private setupEventListeners(): void {
        if (this.prevButton) {
            this.prevButton.addEventListener("click", () => this.decrementPage());
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener("click", () => this.incrementPage());
        }
  
        if (this.searchButton) {
            this.searchButton.addEventListener("click", () => this.searchById());
        }
  
        if (this.mainHeading) {
            this.mainHeading.addEventListener("click", () => this.navigateToHome());
        }
  
        if (this.filterInput && this.errorMessage) {
            this.setupLiveValidation();
        }
    }
    
    // Navigates to the home page by reloading the window.
    navigateToHome(): void {
      console.log("Function #25 - Navigating to Home");
      try {
          window.location.reload();
      } catch (error) {
          console.error(`Error while navigating to home: ${error instanceof Error ? error.message : error}`);
          alert("Failed to reload the page. Please try again.");
      }
    }
    
    // Fetches the next set of records and updates the view.
    async incrementPage(): Promise<void> {
      try {
        console.log("Function #16 - Executing incrementPage");
        this.stateManager.goToNextPage();
        await this.stateManager.retrieveRecords();
        const records = this.stateManager.getRecords();
    
        if (records !== null) {
          this.tableRenderer.renderRecords(records);
        }
        this.updateButtonStates();
      } catch (error) {
        console.error(`Unexpected error in incrementPage: ${error instanceof Error ? error.message : error}`);
      }
    }
    
    // Fetches the previous set of records and updates the view.
    async decrementPage(): Promise<void> {
      try {
        console.log("Function #21 - Executing decrementPage");
        
        this.stateManager.goToPreviousPage();
        await this.stateManager.retrieveRecords();
        const records = this.stateManager.getRecords();
        
        if (records !== null) {
          this.tableRenderer.renderRecords(records);
        }
        
        this.updateButtonStates();
      } catch (error) {
        console.error(`Error in decrementPage: ${error instanceof Error ? error.message : error}`);
      }
    }
    
    // Searches for a record by its ID and updates the view.
    async searchById(): Promise<void> {
      try {
          console.log("Function #23 - Executing searchById");
          
          const searchValue = parseInt(this.filterInput.value, 10);
          if (isNaN(searchValue)) {
              throw new Error('Invalid search value or none');
          }
  
          this.stateManager.setHighlightedId(searchValue); 
          await this.stateManager.searchByIdStateChange(searchValue);
  
          const records = this.stateManager.getRecords();
          
          if (records !== null) {
              this.tableRenderer.renderRecords(records, searchValue);
          }
  
          this.updateButtonStates();
      } catch (error) {
          console.error(`Error in searchById function: ${error instanceof Error ? error.message : error}`);
      }
  }
  
  // Validates input for the search bar in real-time.
  setupLiveValidation(): void {
    this.filterInput.addEventListener('input', () => {
        const inputValue = this.filterInput.value;
  
        if (inputValue.length === 0) {
            this.errorMessage.textContent = "";
        } else if (inputValue.length < 1 || inputValue.length > 6 || !/^\d+$/.test(inputValue)) {
            this.errorMessage.textContent = "Invalid input. Please enter a number between 0 and 999 999.";
        } else {
            this.errorMessage.textContent = "";
        }
    });
  }
  
  // Updates the state of the pagination buttons based on the current view.
  public updateButtonStates(): void {
    try {
        console.log("Function #20 - Executing updateButtonstates");
    
        const from = this.stateManager.getFrom();
        const to = this.stateManager.getTo();
        const totalRecordCount = this.stateManager.getTotalRecordCount();
    
        this.prevButton.disabled = from === 0;
        this.nextButton.disabled = to === totalRecordCount - 1;
  
    } catch (error) {
        console.error(`Unexpected error in updateButtonStates: ${error instanceof Error ? error.message : error}`);
    }
  }
  }