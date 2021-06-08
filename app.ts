import { tableHeadings } from "./classes/table_headings.js";
import { recordStruct } from "./classes/record_struct.js";
import { createTable } from "./classes/create_table.js";
import { HasFormatMethod } from "./interfaces/hasformatmethod.js";
import { request } from './httpreq.js';


//Accessing Form Data
const form = document.querySelector('.navigation') as HTMLFormElement;

const fromID = document.querySelector('#fromID') as HTMLInputElement;
const toID = document.querySelector('#toID') as HTMLInputElement;

// Instantiate grid div
const table = document.querySelector('table')!;
const tble = new createTable(table);

let getHeadings: string[];
let recFromServer: string[][];

function generateTable(){
	let interfaceHeading: HasFormatMethod;
	let interfaceRecords: HasFormatMethod;
	let recHeadingsFromServer: string[] = getHeadings;
	interfaceHeading = new tableHeadings(recHeadingsFromServer[0], recHeadingsFromServer[1], recHeadingsFromServer[2], recHeadingsFromServer[3], recHeadingsFromServer[4], recHeadingsFromServer[5], recHeadingsFromServer[6], recHeadingsFromServer[7], recHeadingsFromServer[8], recHeadingsFromServer[9], recHeadingsFromServer[10]);
	tble.renderHeading(interfaceHeading);
	for(let i=0;i<recFromServer.length;i++) {
		interfaceRecords = new recordStruct(recFromServer[i][0], recFromServer[i][1], recFromServer[i][2], recFromServer[i][3], recFromServer[i][4], recFromServer[i][5], recFromServer[i][6], recFromServer[i][7], recFromServer[i][8], recFromServer[i][9], recFromServer[i][10]);
		tble.renderRecords(interfaceRecords);
	}
}

form.addEventListener('submit', (e: Event) => {
	document.getElementById("table")!.innerHTML = "";
	e.preventDefault();
	
	// Fetch headings from server
	request(
		"/columns", "get",
		function(r: any) {
			let d: string;
			let e: string[];
			try {
				const myArr = JSON.parse(r);
				getHeadings = myArr;
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);

	// Fetch records from server
	let url: string;
	url = "/records?from="+fromID.valueAsNumber+"&to="+toID.valueAsNumber;
	request(
		url, "get",
		function(r: any) {
			let d = {};
			try {
				if (r === []) {
					d = r;
				} else {
					const myArr = JSON.parse(r);
					recFromServer = myArr;
					generateTable();
				}
			} catch(err) {
				console.log(err);
				return;
			}
		}
	);
});

