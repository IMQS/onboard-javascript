//#region AppLogic
//#region API methods
function getRecordCount() {
    return fetch('http://localhost:2050/recordCount')
        .then((response) => {
            return response.json();
        });
}
function getColumnNames() {
    return fetch('http://localhost:2050/columns')
        .then((response) => {
            return response.json();
        });
}
async function getRecords(fromID: number, toID: number) {
    const request = 'http://localhost:2050/records?from=' + (fromID).toString() + '&to=' + (toID).toString();
    return await fetch(request)
        .then((response) => {
            return response.json();
        });
}
//#endregion

//#region Data Loading methods

function placeRecords(fromID: number, toID: number) {
    getRecords(fromID, toID)
        .then((records: Array<Array<string>>) => {
            let appendable = '';
            for (const record of records) {
                 appendable += '<tr id="' + record[0] + '">';
                for (const column of record) {
                    appendable += '<td align="center">' + column.toString() + '</td>';     
                }
                appendable += '</tr>';
                
            }
            $("#ContentBody").empty();
            $("#ContentBody").append(appendable);
        });
    return [fromID as number, toID as number];
}

// Credit: https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940

function placeRecordsFromCursor(cursor: Array<number>) {
    cursor = cursor.sort((a,b) => {return a-b});
    return placeRecords(cursor[0], cursor[1])
}
//#endregion

//#region Handlers
function getPageContent(fromID: number, toID: number) {
    const cursor = [fromID as number, toID as number];
    $("#HeaderRow").empty();
    getColumnNames()
        .then((columns: Array<string>) => {
            for (const column of columns) {
                let writable: string = '<th align="center">' + column + '</th>';
                $("#HeaderRow").append(writable);
            }
        });
    placeRecords(fromID, toID);
    return cursor;
}

function toNumber(input: string | number, output: any = 1) {
    if (typeof input === "string") {
        if (output == 1) {
            return parseInt(input);
        } else {
            return parseFloat(input);
        }
    }
    else if (typeof input === "number") {
        return input;
    }
    else {
        return 0;
    }
}
function nextPageResize(previousCursor: Array<number>): number {
        let fromID = toNumber(previousCursor.sort((a, b) => {return a - b})[0]);
        let toID = toNumber(previousCursor.sort((a, b) => {return a - b})[1]);

        const documentHeight = ($(window).innerHeight() as number) - ($("#" + fromID.toString()).height() as number);
        for (let i = fromID; i <= toID; i++) {
            let element = ($("#" + i.toString()).offset() as JQueryCoordinates).top as number;

            if ( element >= documentHeight ){
                return i;
            } else {
                continue
            };
        }
        return toID
}

function previousPageResize(previousCursor: Array<number>): Array<number> {
    let fromId: number = previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]);
    let toId: number = fromId + step;
    return [previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]), toId]
}
//#endregion
//#endregion

const step: number = 37;
let previousCursor: Array<number>;
let previousScale: number;

window.onload = () => {     
    previousCursor = getPageContent(0,37)
    
    $("#previous-page").click(() => { 
        previousCursor = previousPageResize(previousCursor);
        let fromId: number = (previousCursor[0] >= 0 ? previousCursor[0] : 0) as number;
        let toId: number = (previousCursor[0] >= 0 ? previousCursor[1] : 37) as number;
        getRecordCount()
            .then((value) => {
                fromId = fromId == value - 1 ? fromId - step : fromId;
                toId = toId <= value - 1 ? toId : value - 1;
                previousCursor = placeRecords(fromId, toId);
            });
        
    });

    $("#next-page").click(() => {
            let fromId: number = nextPageResize(previousCursor) as number;
            getRecordCount()
                .then((value) => {
                    if ( fromId <= value - step - 1 ) {
                        let toId: number = fromId + step <= value - 1 ? fromId + step : value - 1;
                        previousCursor = placeRecords(fromId, toId);
                    } else if (fromId <= value - 1)  {
                        previousCursor = placeRecords(fromId, value - 1);
                    } else {
                        alert('You have reached the end of the list')
                    }
                });        
        });

    $("#go-to-button").click(() => {
        let fromId = toNumber($("#go-to-index").val() as string, 2);
        getRecordCount()
            .then((value) => {
                if (Math.floor(fromId).toString() == fromId.toString() === true) {
                    if ( fromId > value - step ) {
                        alert('You may not insert a value greater than ' + (value - step).toString());
                    } else {
                        let toId: number = (fromId as number) + step < value ? (fromId as number) + step : value - 1;
                        previousCursor = placeRecords(fromId, toId);
                    }
                } else {
                    alert('It seems you are not inserting an integer - please ensure that you are.');
                }
            });
    });
}
let resizeTimer: number = 50;
$(window).on('resize', (e) => {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
    getRecordCount()
        .then((value) => {   
            if ( previousCursor[1] == value - 1 ) {
                previousCursor = placeRecords(previousCursor[1]- step, previousCursor[1]);
            }
            $('#body').height(5000 * previousScale);
        })
    }, 250)
});