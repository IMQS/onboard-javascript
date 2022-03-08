class State {
	// TODO: change variable to public/private and add/remove getters and setters
	private records: number;
	private trimStart: number;
	private trimEnd: number;
	private countRec: number;

	contentTable: HTMLElement | null = document.getElementById('content-table');
	tableBody: HTMLTableSectionElement | null = document.querySelector('tbody');
	tableHead: HTMLElement | null = document.getElementById("content-thead");
	pageInfo: HTMLElement | null = document.getElementById('page-info');
	searchBtn: HTMLElement | null = document.getElementById('id-search-btn');
	firstBtn: HTMLElement | null = document.getElementById('first');
	prevBtn: HTMLElement | null = document.getElementById('prev');
	nextBtn: HTMLElement | null = document.getElementById('next');
	lastBtn: HTMLElement | null = document.getElementById('last');
	inputBox: HTMLElement | null = document.getElementById('id-search');

	// Default values for variables that stores server data
	RECORDCOUNT: number = 350;
	HEADERS: string[] = ["ID", "City", "Population"];
	data: any = [[0, "Cape Town", 3500000], [1, "New York", 8500000], [2, "Johannesburg", 4500000]];

	constructor() {
		this.records = this.calculateRecords();
		this.trimStart = 0;
		this.trimEnd = this.records - 1;
		this.countRec = 0;
	}

	getRecords() {
		return this.records;
	}

	getTrimStart() {
		return this.trimStart;
	}

	getTrimEnd() {
		return this.trimEnd;
	}

	getCountRec() {
		return this.countRec;
	}

	setRecords(value: number) {
		this.records = value;
	}

	setTrimStart(value: number) {
		this.trimStart = value;
	}

	setTrimEnd(value: number) {
		this.trimEnd = value;
	}

	setCountRec(value: number) {
		this.countRec = value;
	}

	calculateRecords() {
		return Math.floor((window.innerHeight - 160) / 40); // Estimate of available table space
	}
}
