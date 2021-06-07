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

// Fetch headings from server
let getHeadings: string[];
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
let getRecords: string[][];
request(
	"/records?from=1&to=5", "get",
	function(r: any) {
		let d = {};
		try {
			if (r === []) {
				d = r;
			} else {
				getRecords = r;
				console.log(typeof getRecords);
			}
		} catch(err) {
			console.log(err);
			return;
		}
	}
);

form.addEventListener('submit', (e: Event) => {
	document.getElementById("table")!.innerHTML = "";
	e.preventDefault();

	let interfaceHeading: HasFormatMethod;
	let interfaceRecords: HasFormatMethod;

	let recHeadingsFromServer: string[] = getHeadings;
	interfaceHeading = new tableHeadings(recHeadingsFromServer[0], recHeadingsFromServer[1], recHeadingsFromServer[2], recHeadingsFromServer[3], recHeadingsFromServer[4], recHeadingsFromServer[5], recHeadingsFromServer[6], recHeadingsFromServer[7], recHeadingsFromServer[8], recHeadingsFromServer[9], recHeadingsFromServer[10]);

	// const recFromServer: string[][] = getRecords;
	
	// Dummy data
	const recFromServer: string[][] = [ [ "1", "A1-FqM=", "B1-W5U=", "C1-q4Y=", "D1-M6E=", "E1-IiQ=", "F1-3q4=", "G1-e3c=", "H1-i/c=", "I1-woE=", "J1-ST0=" ], [ "2", "A2-yDY=", "B2-q9s=", "C2-loU=", "D2-ImU=", "E2-cTo=", "F2-ji0=", "G2-SMY=", "H2-rho=", "I2-Ym0=", "J2-RUc=" ], [ "3", "A3-E5g=", "B3-DNI=", "C3-iiE=", "D3-vtc=", "E3-GDQ=", "F3-fJY=", "G3-DfA=", "H3-sUw=", "I3-Cas=", "J3-gE8=" ], [ "4", "A4-ToA=", "B4-I58=", "C4-CNE=", "D4-CA8=", "E4-3nk=", "F4-AVs=", "G4-l4Q=", "H4-Qm4=", "I4-c58=", "J4-6gI=" ], [ "5", "A5-6mQ=", "B5-W6I=", "C5-HZY=", "D5-Eqc=", "E5-7wk=", "F5-bNI=", "G5-RBg=", "H5-Jm4=", "I5-T7s=", "J5-CFo=" ] ];
	tble.renderHeading(interfaceHeading);
	for(let i=fromID.valueAsNumber-1;i<toID.valueAsNumber;i++) {
		interfaceRecords = new recordStruct(recFromServer[i][0], recFromServer[i][1], recFromServer[i][2], recFromServer[i][3], recFromServer[i][4], recFromServer[i][5], recFromServer[i][6], recFromServer[i][7], recFromServer[i][8], recFromServer[i][9], recFromServer[i][10]);
		tble.renderRecords(interfaceRecords);
	}
});

