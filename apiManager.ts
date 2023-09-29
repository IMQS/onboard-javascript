class ApiManager {
	
	private mainUrl: string;

	constructor(mainUrl: string) {
		this.mainUrl = mainUrl;
	}

	private fetchJson(url: string): Promise<any> {
		return fetch(url)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
			})
			.catch(error => {
				throw new Error(`Fetch failed: ${error}`);
			});
	}

	/** Retrieves records from the api */
	getRecords(fromID: number, toID: number): Promise<string[][]> {
		return this.fetchJson(`${this.mainUrl}/records?from=${fromID}&to=${toID}`);
	}

	/** Retrieves columns from the api */
	getColumns(): Promise<string[]> {
		return this.fetchJson(`${this.mainUrl}/columns`);
	}

	/** Retrieves the number of records there are */
	getRecordCount(): Promise<number> {
		return fetch(`${this.mainUrl}/recordCount`)
		.then(res => {
			if(res.ok) {
				return res.text();
			} else {
				throw new Error(`HTTP error? Status: ${res.status}`);
			}
		})
		.then (recordCount => {
			return parseInt(recordCount);
		})
		.catch(error => {
			throw error;
		});
	}
}
