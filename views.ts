//*** Views ***/

/**
 * TableRenderer is responsible for rendering data into an HTML table.
 * It fetches data from the StateManager and populates the table accordingly.
 */

class TableRenderer {
    private stateManager: StateManager;
  
    constructor(stateManager: StateManager) {
      this.stateManager = stateManager;
    }
    
    /**
     * Renders the initial table layout including column names and initial data set.
     * @param {StateManager} stateManager - The manager to fetch state from.
     */
    async initialRender(stateManager: StateManager): Promise<void> {
      try {
          console.log("Function #9 - Executing initialRender");
  
          const columnNames = stateManager.getColumnNames();
          if (columnNames !== null) {
              this.renderColumnNames(columnNames);
          }
  
          await stateManager.retrieveRecords();
          const records = stateManager.getRecords();
  
          if (records !== null) {
              this.renderRecords(records);
          }
      } catch (error) {
          console.error(`Error during initialRender: ${error}`);
      }
  }
  
    renderColumnNames(columnNames: string[]): void {
      console.log("Function #11 - Executing renderColumnNames");
      try {
        const thead = document.querySelector('thead');
        if (thead === null) {
          throw new Error('Table header not found.');
        }
        
        const row = document.createElement('tr');
        for (const columnName of columnNames) {
          const cell = document.createElement('th');
          cell.textContent = columnName;
          row.appendChild(cell);
        }
        thead.appendChild(row);
  
        this.setColumnWidths();
      } catch (error) {
        if (error instanceof Error) {  
          console.error(`An error occurred: ${error.message}`);
        } else {
          console.error(`An unknown error occurred: ${error}`);
        }
      }
    }

    // Sets the widths of table columns evenly.
    setColumnWidths(): void {
      console.log("Function #11.1 - Executing setColumnWidths");
      try {
        const table = document.getElementById("myTable");
        
        if (!table) {
          throw new Error('Table with id "myTable" not found.');
        }
  
        const headerCells = table.querySelectorAll("th");
        const numCols = headerCells.length;
        const colWidth = 100 / numCols;
      
        headerCells.forEach((headerCell: Element) => {
          (headerCell as HTMLElement).style.width = `${colWidth}%`;
        });
      } catch (error) {
        console.error(`Error setting column widths: ${error}`);
      }
  }

    
    //Populates the table body with records. Optionally highlights a specified row if searched.
    renderRecords(records: CityData[] | null, highlightId: number | null = null) {
      console.log("Function #14 - Executing renderRecords");

      // Use the state's highlightedId if no highlightId is provided.
      highlightId = highlightId ?? this.stateManager.getHighlightedId(); 
      try {
        if (records === null) {
          throw new Error("No records to render.");
        }
  
        const tbody = document.querySelector('tbody');
        if (tbody === null) {
          throw new Error('Table body not found.');
        }
        
        tbody.innerHTML = ''; 
        
        records.forEach((record) => {
          const row = document.createElement('tr');
          if (highlightId !== null && record.length > 0 && parseInt(record[0].toString(), 10) === highlightId) {
            row.classList.add('highlight');
          }
          record.forEach((cell) => {
            const td = document.createElement('td');
            td.textContent = cell.toString();
            row.appendChild(td);
          });
          tbody.appendChild(row);
        });
      } catch (error) {
        console.error(`An error occurred: ${error}`);
      }
    }
  }
  