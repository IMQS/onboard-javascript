//#region AppLogic
//#region API methods
function getRecordCount() {
    return fetch('http://localhost:2050/recordCount')
        .then(function (response) {
            return response.json();
        });
}
function getColumnNames() {
    return fetch('http://localhost:2050/columns')
        .then(function (response) {
            return response.json();
        });
}
async function getRecords(fromID: number, toID: number) {
    const request = 'http://localhost:2050/records?from=' + (fromID - 1).toString() + '&to=' + (toID - 1).toString();
    return await fetch(request)
        .then(function (response) {
            return response.json();
        });
}
//#endregion

//#region Data Loading methods
function InsertValue(value: string, id: string) {
    const writable: string = '<td id=\"' + id + '\" align="center">' + value.toString() + '</td>';
    $("#ContentBody").append(writable);
}
function UpdateColumnNames(value: string) {
    const writable: string = '<th align="center">' + value.toString() + '</th>';
    $("#HeaderRow").append(writable);
}
function placeRecords(fromID: number, toID: number) {
    $("#ContentBody").empty();
    getRecords(fromID, toID)
        .then((records: Array<Array<string>>) => {
            for (var rowIndex in records) {
                $("#ContentBody").append('<tr id="' + records[rowIndex][0] + '">');
                for (var columnIndex in records[rowIndex]) {
                    InsertValue(records[rowIndex][columnIndex], records[rowIndex][0]);
                }
                $("#ContentBody").append('</tr>');
            }
        });
    return [fromID as number, toID as number];
}

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
            for (var columnIndex in columns) {
                UpdateColumnNames(columns[columnIndex]);
            }
        });
    placeRecords(fromID, toID);
    return cursor;
}

function toNumber(input: string | number) {
    if (typeof input === "string") {
        return parseInt(input);
    }
    else if (typeof input === "number") {
        return input;
    }
    else {
        return 0;
    }
}
function nextPageResize(previousCursor: Array<number>): number {
        $("form-content").height()
        var fromID = toNumber(previousCursor.sort((a, b) => {return a - b})[0]);
        var toID = toNumber(previousCursor.sort((a, b) => {return a - b})[1]);

        for (var i = fromID; i <= toID; i++) {
            var element = ($("#" + i.toString()).offset() as JQueryCoordinates).top as number;
            var documentHeight = ($(window).innerHeight() as number) - ($("form-content").innerHeight() as number) - 10;

            if ( element >= documentHeight ){
                return i;
            } else {
                continue
            };
        }
        return toID
}

function previousPageResize(previousCursor: Array<number>): Array<number> {
    var fromId: number = previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]);
    var toId: number = fromId + step;
    return [previousCursor[0] - (nextPageResize(previousCursor) - previousCursor[0]), toId]
}
//#endregion
//#endregion

var step: number = 37;
var previousCursor: Array<number>;

window.onload = () => {     
    previousCursor = getPageContent(0,37)
    
    $("#previous-page").click(() => { 
        previousCursor = previousPageResize(previousCursor);
        var fromId: number = (previousCursor[0] >= 0 ? previousCursor[0] : 0) as number;
        var toId: number = (previousCursor[0] >= 0 ? previousCursor[1] : 37) as number;
        previousCursor = placeRecords(fromId, toId);
    });

    $("#next-page").click(() => {
        var fromId: number = nextPageResize(previousCursor) as number;
        getRecordCount()
            .then((value) => {
                if ( fromId > value - 1 ) {
                    alert('Step size is too large')
                } else {
                    var toId: number = fromId + step < value ? fromId + step : value;
                    previousCursor = placeRecords(fromId, toId);
                }
            });
    });

    $("#go-to-button").click(() => {
        var index: number = toNumber($("#go-to-index").val() as string);
        var fromId: number = index;
        getRecordCount()
            .then((value) => {
                var toId: number = (index as number) + step < value ? (index as number) + step : value;
                previousCursor = placeRecords(fromId, toId);
            });
    });
}
var resizeTimer: number = 50;
$(window).on('resize', function(e) {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        var num = ( $(window).innerHeight() as number )/( $("#10").height() as number );
        previousCursor = placeRecordsFromCursor(previousCursor);
    }, 250);
});