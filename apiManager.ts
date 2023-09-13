class ApiManager {
	private mainUrl: string;

	constructor(mainUrl: string) {
		this.mainUrl = mainUrl;
	}

	private fetchJson(mainUrl: string): Promise<any> {
		return fetch(mainUrl)
			.then(res => {
				if (res.ok) {
					return res.json()
				} else {
					throw new Error(`HTTP error! Status: ${res.status}`)
				}
			})
			.catch(error => {
				throw new Error(`Fetch failed: ${error}`);
			});
	}

	/** Retrieves records from the api */
	getRecords(fromID: number, toID: number): Promise<string[][]> {
		return this.fetchJson(`${this.mainUrl}records?from=${fromID}&to=${toID}`);
	}

	/** Retrieves columns from the api */
	getColumns(): Promise<string[]> {
		return this.fetchJson(`${this.mainUrl}columns`);
	}

	/** Retrieves the number of records there are */
	getRecordCount(): Promise<number> {
		let test = `${this.mainUrl}recordCount`
		return this.fetchJson(`${this.mainUrl}recordCount`);
	}
}
