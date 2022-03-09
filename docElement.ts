class docElement {

	private contentTable: HTMLElement | null;
	tableBody: HTMLTableSectionElement | null;
	tableHead: HTMLElement | null;
	pageInfo: HTMLElement | null;
	searchBtn: HTMLElement | null;
	firstBtn: HTMLElement | null;
	prevBtn: HTMLElement | null;
	nextBtn: HTMLElement | null;
	lastBtn: HTMLElement | null;
	inputBox: HTMLElement | null;

	constructor() {
		this.contentTable = document.getElementById('content-table');
		this.tableBody = this.contentTable!.querySelector('tbody');
		this.tableHead = document.getElementById('content-thead');
		this.pageInfo = document.getElementById('page-info');
		this.searchBtn = document.getElementById('id-search-btn');
		this.firstBtn = document.getElementById('first');
		this.prevBtn = document.getElementById('prev');
		this.nextBtn = document.getElementById('next');
		this.lastBtn = document.getElementById('last');
		this.inputBox = document.getElementById('id-search');
	}
}
