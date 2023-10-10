//*** Data ***/

type CityData = (number | string)[];

/** Manages API requests for fetching record count, column names, and data records.*/
class ApiManager {
	totalRecordCount: number;
	columnNames: string[] | null;

	constructor () {
		this.totalRecordCount = 0;
		this.columnNames = null;
	}

	async fetchTotalRecordCount(): Promise<void> {
		const response = await fetch("http://localhost:2050/recordCount").catch(
			(error) => {
				console.error(`Network error fetching record count: ${error}`);
				throw error;
			}
		);

		if (!response.ok) {
			const errorMessage = `Failed to fetch total record count: ${response.statusText}`;
			console.error(errorMessage);
			throw new Error(errorMessage);
		}

		const data: number = await response.json().catch((error) => {
			console.error(`Error parsing JSON for record count: ${error}`);
			throw error;
		});

		this.totalRecordCount = data;
	}

	async fetchColumnNames(): Promise<void> {
		const response = await fetch("http://localhost:2050/columns").catch(
			(error) => {
				console.error(`Network error fetching column names: ${error}`);
				throw error;
			}
		);

		if (!response.ok) {
			const errorMessage = `Failed to fetch column names: ${response.statusText}`;
			console.error(errorMessage);
			throw new Error(errorMessage);
		}

		const data: string[] = await response.json().catch((error) => {
			console.error(`Error parsing JSON for column names: ${error}`);
			throw error;
		});

		this.columnNames = data;
	}

	async fetchRecords(from: number, to: number): Promise<CityData[] | null> {
		const response = await fetch(
			`http://localhost:2050/records?from=${from}&to=${to}`
		).catch((error) => {
			console.error(`Network error fetching records: ${error}`);
			throw error;
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch records: ${response.statusText}`);
		}

		const data: CityData[] = await response.json();
		return data;
	}
}
