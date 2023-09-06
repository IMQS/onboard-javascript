export class ApiManager {
	private mainUrl: string;
	constructor(mainUrl: string) {
		this.mainUrl = mainUrl;
	}

	private fetchJson(mainUrl: string): Promise<any> {
		return fetch(mainUrl)
			.then(res => res.text())
			.then(data => JSON.parse(data))
			.catch((err) => {
				throw err
			})
	}

	// This function  will handle retrieving the records from the api
	getRecords(fromID: number, toID: number): Promise<string[][]> {
		return this.fetchJson(`${this.mainUrl}records?from=${fromID}&to=${toID}`);
	}

	// This function  will handle retrieving the columns from the api
	getColumns(): Promise<string[]> {
		return this.fetchJson(`${this.mainUrl}columns`);
	}

	// This function  will handle retrieving the record count from the api
	getRecordCount(): Promise<number> {
		return this.fetchJson(`${this.mainUrl}recordCount`);
	}
}
