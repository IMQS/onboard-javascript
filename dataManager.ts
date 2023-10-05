class dataManager {
	backend: string = "http://localhost:2050";

	/** fetches the number of records from backend */
	fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.text();
			})
			.then(totalRecords => {
				const value = parseInt(totalRecords, 10);
				if (isNaN(value)) {
					throw new Error('Invalid response format');
				}
				return value;
			})
			.catch(err => {
				throw 'Error fetching the record count: ' + err;
			});
	}

	/** fetches columns from backend */
	fetchColumns(): Promise<string[]> {
		return fetch(`${this.backend}/columns`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch columns';
				}
				return res.json();
			})
			.catch(err => {
				throw 'Error fetching columns' + err;
			});
	}

	/** fetches records from backend */
	fetchRecords(from: number, to: number): Promise<string[]> {
		return fetch(`${this.backend}/records?from=${from}&to=${to}`)
			.then(res => {
				if (!res.ok) {
					throw "Sorry, there's a problem with the network";
				}
				return res.json();
			})
			.catch(err => {
				throw 'Error fetching records from server ' + err;
			});
	}
}
