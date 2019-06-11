//#region Global Variables
let resizeTimer = 50;
let previousCursor: number[];
let previousScale: number;

//#endregion Global Variables

//#region AppLogic
//#region API
async function getRecordCount() : Promise<number> {
    const response = await fetch('http://localhost:2050/recordCount');
    return await response.json();
}

async function getColumnNames() : Promise<string[]>{
    const response = await fetch('http://localhost:2050/columns');
    return await response.json();
}

async function getRecords(fromID: number, toID: number): Promise<string[][]> {
    const response = await fetch(`http://localhost:2050/records?from=${(fromID).toString()}&to=${(toID).toString()}`);
    return await response.json();
}

//#endregion API

//#region Data Loading methods

async function placeRecords(fromID: number, toID: number): Promise<number[]> {
    const records = await getRecords(fromID, toID)
    let appendable = '';
    for (const record of records) {
            appendable += `<tr id="table-row-${record[0]}">`;
        for (const column of record) {
            appendable += `<td align="center">${column.toString()}</td>`;     
        }
        appendable += '</tr>';
    }
    $("#WrapperTable-ContentBody").empty();
    $("#WrapperTable-ContentBody").append(appendable);
    return await [fromID as number, toID as number];
}

// Credit: https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940

async function placeRecordsFromCursor(cursor: number[]): Promise<number[]> {
    cursor = cursor.sort((a,b) => {return a-b});
    return await placeRecords(cursor[0], cursor[1]);
}
//#endregion Data Loading methods

//#region Handlers
async function getPageContent(fromID: number, toID: number): Promise<number[]> {
    $("#WrapperTable-HeaderRow").empty();
    getColumnNames()
        .then((columns: string[]) => {
            for (const column of columns) {
                let writable: string = `<th align="center">${column}</th>`;
                $("#WrapperTable-HeaderRow").append(writable);
            }
        });
    return await placeRecords(fromID, toID);
}

function toNumber(input: string | number, output: any = 1) : number {
    switch (typeof input) {
        case ('string'):
            if (output == 1) {
                return parseInt(input as string);
            }
            return parseFloat(input as string);
        case ("number"):
            return input as number;
        default:
            return 0;
    }
}

function calculateToId(fromId: number): number {
    const possibleRecords = Math.floor((window.innerHeight - ($("#form-content").innerHeight() as number)) / 37);
    const possibleId = fromId + possibleRecords;

    let recordDisplayOffset = 0;
    if (window.innerHeight <= 646) {
        recordDisplayOffset = 0
    } else if (window.innerHeight <= 969) {
        recordDisplayOffset = 1;
    } else if (window.innerHeight <= 1938) {
        recordDisplayOffset = 3
    } else {
        recordDisplayOffset = 15
    }

    return recordDisplayOffset + possibleId;
}

function nextPageResize(previousCursor: number[]): number {
        const fromID = toNumber(previousCursor.sort((a, b) => {return a - b})[0]);
        const toID = toNumber(previousCursor.sort((a, b) => {return a - b})[1]);
        const documentHeight = $(window).innerHeight() as number - ($(`#table-row-${fromID.toString()}`).height() as number);

        for (let i = fromID; i <= toID; i++) {
            const elementHeightOffset = ($(`#table-row-${i.toString()}`).offset() as JQueryCoordinates).top;

            if (elementHeightOffset >= documentHeight){
                return i;
            } else {
                continue;
            }
        }
        return toID;
}

function previousPageResize(previousCursor: number[]): number[] {
    const toId = calculateToId(previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]));
    return [previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]), toId];
}
//#endregion Handlers
//#endregion AppLogic


window.onload = async () => {     
    previousCursor = await getPageContent(0, calculateToId(0));
    
    $("#previous-page").click(async () => { 
        const recordCount = await getRecordCount();
        previousCursor = previousPageResize(previousCursor);
        let fromId = previousCursor[0] >= 0 ? previousCursor[0] : 0;
        const possibleStep = calculateToId(fromId) - fromId;
        let toId = (previousCursor[0] >= 0 ? previousCursor[1] : possibleStep);
        fromId = fromId == recordCount - 1 ? fromId - possibleStep : fromId;
        toId = toId <= recordCount - 1 ? toId : recordCount - 1;
        previousCursor = await placeRecords(fromId, toId);
        
    });

    $("#next-page").click(async () => {
        const recordCount = await getRecordCount();
        const fromId = nextPageResize(previousCursor);
        const possibleStep = calculateToId(fromId) - fromId;
        if (fromId <= recordCount - possibleStep - 1) {
            const toId = fromId + possibleStep <= recordCount - 1 ? fromId + possibleStep : recordCount - 1;
            previousCursor = await placeRecords(fromId, toId);
        } else if (fromId <= recordCount - 1)  {
            previousCursor = await placeRecords(recordCount - 1 - (calculateToId(fromId) - fromId), recordCount - 1);
            alert('You reached the last record - which is shown at the bottom of the screen');
        } else {
            alert('You have reached the end of the list');
        }
    });

    $("#go-to-button").click(async () => {
        const recordCount = await getRecordCount();
        const fromId = toNumber($("#go-to-index").val() as string, 2);
        const possibleStep = calculateToId(fromId) - fromId;
        if (fromId < 0){
            alert('You may only insert Id greater than or equal to 0');
        } else {
            if (Math.floor(fromId).toString() == fromId.toString() === true) {
                if ( fromId > recordCount - possibleStep ) {
                    alert(`You may not insert a desired Id greater than ${(recordCount - possibleStep).toString()}`);
                } else {
                    let toId = (fromId) + possibleStep < recordCount ? (fromId) + possibleStep : recordCount - 1;
                    previousCursor = await placeRecords(fromId, toId);
                }
            } else {
                alert('It seems you are not inserting an integer - please ensure that you are.');
            }
        }
    });
}

window.onresize = () => {
    const nextToId = calculateToId(previousCursor[0]);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
        const recordCount = await getRecordCount();
        if (nextToId >= recordCount - 1) {
            const fromId = recordCount - 1 - (calculateToId(previousCursor[0]) - previousCursor[0]);
            const toId = recordCount - 1;
            previousCursor = await placeRecords(fromId, toId);
            alert('Note that since you were on the last page, the final record is still at the bottom of your page');
        } else {
            previousCursor = await placeRecords(previousCursor[0], nextToId)
        }
    }, 250);
}
