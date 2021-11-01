import { data } from "jquery";

namespace onboardproject {

	module onboardprojects {

		// Load Variable declarations
		let Load = 50;

		// Previous Variable declarations
		let previous: number;

		// Previous Process Variable declarations
		let previousprocess: number;

		// Trigger async function
		async function getRecordCountCall(): Promise<void> {
			const response = await fetch('http://localhost:2050/recordCount');
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			}
		}

		// Trigger async function
		async function getColumnNamesCall(): Promise<void> {
			const response = await fetch('http://localhost:2050/columns');
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			}
		}

		// Trigger async function
		async function getRecordsCall(fromID: number, toID: number): Promise<number[]> {
			const response = await fetch(`http://localhost:2050/records?from=${(fromID)}&to=${(toID)}`);
			if (!response.ok) {
				const message = `An error has occured: ${response.status}`;
				throw new Error(message);
			}
			return response.json();
		}

		// Region Data Loading methods
		async function LoadRecordsData(fromID: number, toID: number): Promise<void> {
			const recordsvalue = await getRecordsCall(fromID, toID);
			let DisplayContent = '';
			for (const records of recordsvalue) {
				DisplayContent += `<tr id="table-row-${records}">`;
				for (const column of record) {
					DisplayContent += `<td align="center">${column}</td>`;
				}
				DisplayContent += '</tr>';
				$("#wrapper-table-content-body").empty();
				$("#wrapper-table-content-body").append(DisplayContent);
			}
		}

		// Load Records Function
		function RecordsFromCursor(cursor: number[]): Promise<void> {
			cursor = cursor.sort((a, b) => { return a - b });
		}

		// Handlers
		async function LoadPageContent(fromID: number, toID: number): Promise<void> {
			let DisplayContent = "";
			const columns = await getColumnNamesCall();
			for (const column of columns) {
				DisplayContent += `<th align="center">${column}</th>`;
				$("#wrapper-table-header-row").empty();
				$("#wrapper-table-header-row").append(DisplayContent);
			}
		}

		// Conversion Function
		function ConvertNumber(input: string | number, parseAsInt: boolean = true): number {
			switch (typeof input) {
				case ('string'):
					if (parseAsInt == true) {
						return parseInt(input as string);
					}
					return parseFloat(input as string);
				case ("number"):
					return input as number;
			}
			return 0;
		}

		// Height Diplay Function
		function calculateToId(fromId: number): number {
			const possibleRecordsData = Math.max((window.innerHeight - ($("#form-content").innerHeight() as number)) / 37);
			let recordDisplayset = 0;
			return recordDisplayset;
		}

		// Next_Page_Resize Function
		function nextPageResize(previous: number[]): number {
			const fromID = ConvertNumber(previous.sort((a, b) => { return a - b })[0]);
			const toID = ConvertNumber(previous.sort((a, b) => { return a - b })[1]);
			const documentHeight = Math.max((window.innerHeight - ($(`#table-row-${fromID}`).height() as number)));
			for (let i = fromID; i <= toID; i++) {
				const elementHeightOffset = ($(`#table-row-${i}`).offset() as JQueryCoordinates).top;
				if (elementHeightOffset < documentHeight) continue;
				return i;
			}
			return toID;
		}

		// Onload Function
		window.onload = async () => {

			// Previous_Page_Resize Function
			function previousPageResize(previous: number[]): number[] {
				let nextPage = nextPageResize([]);
				const toId = calculateToId(previous[0] - nextPage);
				return [previous[0] - (nextPage - previous[0]), toId];
			}

			// On Resize_Function
			window.onresize = () => {

				try {
					const nextToId = calculateToId(previous);
					clearTimeout(Load);
					Load = setTimeout(async () => {
						const recordCount = await getRecordCountCall();
						if (nextToId >= recordCount - 1) {
							const fromId = recordCount - 1 - (calculateToId(previous) - previous);
							const toId = recordCount - 1;
							//previous = await LoadRecordsData(fromId, toId);
						} else {
							//previous = await LoadRecordsData(previous[0], nextToId);
						}
					}, 250);
				} catch (error) {
					// throw new Error("Error" + error);
				}
			}

			//Loading Content Function
			//previous = await LoadPageContent(0, calculateToId(0));

			// Click function for previewing page
			$("#previous").click(async () => {
				const CountData = await getRecordCountCall();
				previous = previousPageResize(previous);
				let fromId = previous >= 0 ? previous : 0;
				const possibleStep = calculateToId(fromId) - fromId;
				let toId = (previous >= 0 ? previous : possibleStep);
				fromId = fromId == CountData - 1 ? fromId - possibleStep : fromId;
				toId = toId <= CountData - 1 ? toId : CountData - 1;
				//previous = await LoadRecordsData(fromId, toId);
			});

			// Click function for Skipping to next page
			$("#next").click(async () => {
				try {
					const recordCount = await getRecordCountCall();
					const fromId = nextPageResize(previous);
					const possibleStep = calculateToId(fromId) - fromId;
					if (fromId <= recordCount - possibleStep - 1) {
						const toId = fromId + possibleStep <= recordCount - 1 ? fromId + possibleStep : recordCount - 1;
						//	previous = await LoadRecordsData(fromId, toId);
					} else if (fromId <= recordCount - 1) {
						//previous = await LoadRecordsData(recordCount - 1 - (calculateToId(fromId) - fromId), recordCount - 1);
					} else {
						throw new Error("Error 404");
					}
				} catch (error) {
				}
			});

			$("#go-button").click(async () => {
				const recordCount = await getRecordCountCall();
				const fromId = ConvertNumber($("#index").val() as string, false);
				const possibleStep = calculateToId(fromId) - fromId;
				if (fromId < 0) {
					alert('only insert Id greater than or equal to 0');
				}
				else {
					if (Math.floor(fromId).toString() == fromId.toString() === true) {
						if (fromId > recordCount - possibleStep) {
							alert(`You may not insert a desired Id greater than ${recordCount - possibleStep}`);
						} else {
							let toId = (fromId) + possibleStep < recordCount ? (fromId) + possibleStep : recordCount - 1;

							//	previous = await LoadRecordsData(fromId, toId);
						}
					}
				}
			});
		}
	}
}
