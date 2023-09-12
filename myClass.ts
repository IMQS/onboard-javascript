class Myclass {
	firstNumber: number = 0;
	lastNumber: number = 0;
	backend: string = "http://localhost:2050";
	resizeTimeout: number = 0;

	/** fetches the number of records from backend */
	fetchRecordCount(): Promise<number> {
		return fetch(`${this.backend}/recordCount`)
			.then(res => {
				if (!res.ok) {
					throw 'Failed to fetch record count';
				}
				return res.json();
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
	fetchRecords(from: number, to: number): Promise<any[]> {
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
