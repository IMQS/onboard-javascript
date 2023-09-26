//*** Data ***/

type CityData = [number, string, number];

// Manages API requests for fetching record count, column names, and data records.
class ApiManager {
  totalRecordCount: number;
  columnNames: string[] | null;
  
  constructor() {
    this.totalRecordCount = 0;
    this.columnNames = null;
  }

  async fetchTotalRecordCount(): Promise<void> {
    console.log("Function #3 - Executing fetchTotalRecordCount");
    try {
      const response = await fetch('http://localhost:2050/recordCount');
      if (!response.ok) {
        throw new Error(`Failed to fetch total record count: ${response.statusText}`);
      }
      const data: number = await response.json();
      this.totalRecordCount = data;
    } catch (error) {
      console.error(`Error fetching total record count: ${error}`);
    }
  }
  
  async fetchColumnNames(): Promise<void> {
    console.log("Function #5 - Executing fetchColumnNames");
    try {
      const response = await fetch('http://localhost:2050/columns');
      if (!response.ok) {
        throw new Error(`Failed to fetch column names: ${response.statusText}`);
      }
      const data: string[] = await response.json();
      this.columnNames = data;
    } catch (error) {
      console.error(`Error fetching column names: ${error}`);
    }
  }
  
  async fetchRecords(from: number, to: number): Promise<CityData[] | null> {
    console.log(`Function #12.1 - Executing fetchRecords with from: ${from}, to: ${to}`);
    try {
      const response = await fetch(`http://localhost:2050/records?from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }
      const data: CityData[] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching records: ${error}`);
      return null;
    }
  }
}