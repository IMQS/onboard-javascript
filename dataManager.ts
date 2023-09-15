class dataManager {
	// firstNumber: number = 0;
	// lastNumber: number = 0;
	static backend: string = "http://localhost:2050";
	// resizeTimeout: number = 0;

	/** fetches the number of records from backend */
	static fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.json()
			})
			.then(totalRecords => {
				if(typeof totalRecords !== 'number'){
					throw new Error('Invalid response format');
				}
				return totalRecords;
			})
			.catch(err => {
				throw 'Error fetching the record count: ' + err;
			});
	}

	/** fetches columns from backend */
	static fetchColumns(): Promise<string[]> {
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
	static fetchRecords(from: number, to: number): Promise<string[]> {
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
