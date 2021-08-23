import { data } from "jquery";

namespace onboardproject {
	module onboardprojects {

		//Load Variable declarations
		let Load = 50;
		// Previous Variable declarations
		let previous: number[];
		//Previous Process Variable declarations
		let previousprocess: number;

		// region API Call
		// Trigger async function
		async function getRecordCountCall(): Promise<number> {
			const response = await fetch('http://localhost:2050/recordCount');
			// let promise = new Promise((res, rej) => {
			// 	setTimeout(() => res("Now it's done!"), 50)
			// });
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				//throw new Error(message);
				console.log(message)
			} else {
				console.log(response);
			}
			return await response.json();
		}
		// Trigger async function
		async function getColumnNamesCall(): Promise<string[]> {
			const response = await fetch('http://localhost:2050/columns');
			// let promise = new Promise((res, rej) => {
			// 	setTimeout(() => res("Now it's done!"), 50)
			// });
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			} else {
				return await response.json();
				console.log(response);
			}
		}

		async function getRecordsCall(fromID: number, toID: number): Promise<string[][]> {
			const response = await fetch(`http://localhost:2050/records?from=${(fromID)}&to=${(toID)}`);
			// let promise = new Promise((res, rej) => {
			// 	setTimeout(() => res("Now it's done!"), 50)
			// });
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			} else {
				return await response.json();
				console.log(response);
			}
		}
		// function requestcolumns<Request>(
		//     method: 'GET',
		//     url: 'http://localhost:2050/columns',
		//     content?: Request,
		//     callback?: (response: Response) => void,
		//     errorCallback?: (err: any) => void) {
		// const request = new XMLHttpRequest();
		// request.open(method, url, true);
		// request.onload = function () {
		//     if (this.status >= 200 && this.status < 400) {
		//         // Success!
		//         const data = JSON.parse(this.response) as Response;
		//         callback && callback(data);
		//     } else {
		//         // We reached our target server, but it returned an error

		//         console.log("Error 404");
		//     }
		// };
		// }
		//region Data Loading methods
		async function LoadRecordsData(fromID: number, toID: number): Promise<number[]> {
			const recordsvalue = await getRecordsCall(fromID, toID)
			let DisplayContent = '';
			for (const record of recordsvalue) {
				DisplayContent += `<tr id="table-row-${record[0]}">`;
				for (const column of record) {
					DisplayContent += `<td align="center">${column}</td>`;
				}
				DisplayContent += '</tr>';
				$("#wrapper-table-content-body").empty();
				$("#wrapper-table-content-body").append(DisplayContent);
			}
			return [fromID, toID];
		}
		function RecordsFromCursor(cursor: number[]): Promise<number[]> {
			cursor = cursor.sort((a, b) => { return a - b });
			return LoadRecordsData(cursor[0], cursor[1]);
			// throw new Error("Error");
		}
		window.onresize = () => {
			try {
				const nextToId = calculateToId(previous[0]);
				clearTimeout(Load);
				Load = setTimeout(async () => {
					const recordCount = await getRecordCountCall();
					if (nextToId >= recordCount - 1) {
						const fromId = recordCount - 1 - (calculateToId(previous[0]) - previous[0]);
						const toId = recordCount - 1;
						previous = await LoadRecordsData(fromId, toId);
					} else {
						previous = await LoadRecordsData(previous[0], nextToId)
					}
				}, 10);
			} catch (error) {
				// throw new Error("Error" + error);
			}
		}
		// Handlers
		async function LoadPageContent(fromID: number, toID: number): Promise<number[]> {
			let DisplayContent = "";
			const columns = await getColumnNamesCall();
			for (const column of columns) {
				DisplayContent += `<th align="center">${column}</th>`;
				$("#wrapper-table-header-row").empty();
				$("#wrapper-table-header-row").append(DisplayContent);
			}
			return await LoadRecordsData(fromID, toID);
		}
		function ConvertNumber(input: string | number, parseAsInt: boolean = true): number {
			switch (typeof input) {
				case ('string'):
					if (parseAsInt == true) {
						return parseInt(input as string);
					}
					return parseFloat(input as string);
				case ("number"):
					return input as number;
				default:
					return 0;
			}
			// throw new Error("Error");
		}
		function calculateToId(fromId: number): number {
			const possibleRecordsData = Math.max((window.innerHeight - ($("#form-content").innerHeight() as number)));
			const possibleId = fromId + possibleRecordsData;
			let recordDisplayset = 0;
			switch (recordDisplayset) {
				case 0:
					window.innerHeight <= 646;
					break;
				case 1:
					window.innerHeight <= 969;
					break;
				case 2:
					window.innerHeight <= 1938;
					break;
				default:
					recordDisplayset = 15;
					break;
			}
			return recordDisplayset + possibleId;
		}
		function nextPageResize(previous: number[]): number {
			const fromID = ConvertNumber(previous.sort((a, b) => { return a - b })[0]);
			const toID = ConvertNumber(previous.sort((a, b) => { return a - b })[1]);
			const documentHeight = $(window).innerHeight() as number - ($(`#table-row-${fromID}`).height() as number);
			for (let i = fromID; i <= toID; i++) {
				const elementHeightOffset = ($(`#table-row-${i}`).offset() as JQueryCoordinates).top;
				if (elementHeightOffset < documentHeight) continue;
				return i;
			}
			return toID;
		}
		function previousPageResize(previous: number[]): number[] {
			const toId = calculateToId(previous[0] - (nextPageResize(previous) - previous[0]));
			return [previous[0] - (nextPageResize(previous) - previous[0]), toId];
		}
		window.onload = async () => {
			// trigger async function
			// log response or catch error of fetch promise
			getColumnNamesCall().then(data => console.log(data)).catch(reason => console.log(reason.message));
			// trigger async function
			// log response or catch error of fetch promise
			getRecordCountCall().then(data => console.log(data)).catch(reason => console.log(reason.message));

			//Loading Content Function
			previous = await LoadPageContent(0, calculateToId(0));
			//click function for previewing page
			$("#previous").click(async () => {
				const CountData = await getRecordCountCall();
				previous = previousPageResize(previous);
				let fromId = previous[0] >= 0 ? previous[0] : 0;
				const possibleStep = calculateToId(fromId) - fromId;
				let toId = (previous[0] >= 0 ? previous[1] : possibleStep);
				fromId = fromId == CountData - 1 ? fromId - possibleStep : fromId;
				toId = toId <= CountData - 1 ? toId : CountData - 1;
				previous = await LoadRecordsData(fromId, toId);
			});
			//click function for Skipping to next page
			$("#next").click(async () => {
				try {
					const recordCount = await getRecordCountCall();
					const fromId = nextPageResize(previous);
					const possibleStep = calculateToId(fromId) - fromId;
					if (fromId <= recordCount - possibleStep - 1) {
						const toId = fromId + possibleStep <= recordCount - 1 ? fromId + possibleStep : recordCount - 1;
						previous = await LoadRecordsData(fromId, toId);
					} else if (fromId <= recordCount - 1) {

						previous = await LoadRecordsData(recordCount - 1 - (calculateToId(fromId) - fromId), recordCount - 1);
					} else {
						console.log("Test is working ");
					}
				} catch (error) {
				}
			});
			//Searching function for index
			$("#go-button").click(async () => {
				const recordCount = await getRecordCountCall();
				const fromId = ConvertNumber($("#index").val() as string, false);
				const possibleStep = calculateToId(fromId) - fromId;
				if (fromId < 0) {
					alert('only insert Id greater than or equal to 0');
				} else {
					if (Math.floor(fromId).toString() == fromId.toString() === true) {
						if (fromId > recordCount - possibleStep) {
							alert(`You may not insert a desired Id greater than ${recordCount - possibleStep}`);
						} else {
							let toId = (fromId) + possibleStep < recordCount ? (fromId) + possibleStep : recordCount - 1;
							previous = await LoadRecordsData(fromId, toId);
						}
					} else {
						console.log("Test is working ");
					}
				}
			});
		}
	}
}
