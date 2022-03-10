class State {
	records: number;
	trimStart: number;
	trimEnd: number;
	isDefaultNode: boolean;

	private RECORDCOUNT: number;
	private HEADERS: string[];
	data: any;

	constructor() {
		this.records = this.calculateRecords();
		this.trimStart = 0;
		this.trimEnd = this.records - 1;
		this.isDefaultNode = true;

		// Default values for variables that stores server data
		this.RECORDCOUNT = 350;
		this.HEADERS = ["ID", "City", "Population"];
		this.data = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];
	}

	getRecordCount() {
		return this.RECORDCOUNT;
	}

	getHeaders() {
		return this.HEADERS;
	}

	setRecordCount(value: number) {
		this.RECORDCOUNT = value;
	}

	setHeaders(value: string[]) {
		this.HEADERS = value;
	}

	calculateRecords() {
		// Estimate of available table space
		// The calculation is an estimate of how many space there is for rows (160 is estimate space for header and footer of website)
		return Math.floor((window.innerHeight - 160) / 40);
	}
}
