window.onload = () => {

    let numColumns: number;
    let columns: any;
    let recordCount: number;
    let startIndex = 0; // Default value = 20;
    let tableRecordCount = 20; // Default value = 20;

    // Canvas:
    let canvas = document.createElement("div");
    canvas.id = "canvas";
    $("body").append(canvas);

    // Buttons and fields:
    let searchbtn = document.createElement("button");
    searchbtn.innerText = "Search";

    let nextbtn = document.createElement("button");
    nextbtn.innerText = "Next Page";

    let prevbtn = document.createElement("button");
    prevbtn.innerText = "Previous Page";

    let fromField = document.createElement("input");
    fromField.placeholder = "from";

    // on clicks:
    searchbtn.onclick = function() {
        let from = parseInt(fromField.value, 10);
        // validate field:
        if (validate(from)) {
            let end = 19;
            startIndex = from;
            if (recordCount < startIndex + 20) {
                end = recordCount - startIndex - 1;
            }
            getRecords(from, startIndex + end);
        }
    };

    nextbtn.onclick = function() {
        let end = 19;
        if (recordCount > startIndex + 20) {
            startIndex += 20;
            if (recordCount < startIndex + 20) {
                end = recordCount - startIndex - 1;
            }
            getRecords(startIndex, startIndex + end);
        }
    };

    prevbtn.onclick = function() {
        if (startIndex >= 20) {
            startIndex -= 20;
        } else if (startIndex < 20) {
            startIndex = 0;
        }
        getRecords(startIndex, startIndex+19);
    };

    $("#canvas").append(searchbtn, fromField, prevbtn, nextbtn);

    initiate();

    /**
     * Initiates the HTTP requests to obtain the records and column values necessary for the table.
     */
    function initiate() {
        // get number of records:
        $.ajax({
            url: "http://localhost:2050/recordCount",
            success: function (result) {
                recordCount = parseInt(JSON.parse(result), 10);
                // get columns:
                $.ajax({
                    url: "http://localhost:2050/columns",
                    success: function (result) {
                        columns = JSON.parse(result);
                        numColumns = getSize(columns);
                        // get first page of records and display them:
                        getRecords(0, 19);
                    },
                    error: function (err) {
                        $("body").text("Error: " + err.status + " " + err.statusText);
                    }
                });
            },
            error: function (err) {
                $("body").text("Error: " + err.status + " " + err.statusText);
            }
        });
    }

    /**
     * Generates a table populated with data, distrubuted evenly.
     * @param data The data records retrieved from the server, structured as a 2D object array.
     * @param columns An object array containing the column heading values.
     */
    function generateTable(data: any, columns: any) {
        $("table").remove(); // Remove previous table
        let dataSize = getSize(data);
        let table = document.createElement("table");
        let tbdy = document.createElement("tbody");
        table.appendChild(generateHeadings(columns));
        for (let i = 0; i < 20; i++){
            let tr = document.createElement("tr");
            for (let j = 0; j < numColumns; j++){
                let td = document.createElement("td");
                if (dataSize > i)
                    td.appendChild(document.createTextNode(data[i][j]));
                tr.appendChild(td);
            }
            tbdy.appendChild(tr);
        }
        table.appendChild(tbdy);
        canvas.appendChild(table);
    }

    /**
     * Finds the number of entries within a data set.
     * @param data An array of data, type is unknown (any).
     */
    function getSize(data: any) {
        let i = 0;
        let entry;
        for (entry in data) {
            i++;
        }
        return i;
    }

    /**
     * Sends out an HTTP request to retrieve data records, coupled with generating a table to display the records.
     * @param from The ID value from which to start searching.
     * @param to The ID value from which to stop searching.
     */
    function getRecords(from: number, to: number) {
        $.ajax({
            url: "http://localhost:2050/records",
            data: {from: from, to: to},
            success: function (result) {
                let data = JSON.parse(result);
                generateTable(data, columns);
            },
            error: function (err) {
                $("body").text("Error: " + err.status + " " + err.statusText);
            }
        });
    }

    /**
     * Generates and returns a "thead" object containing column headings.
     * @param columns An object array containing the column heading values.
     */
    function generateHeadings(columns: any) {
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        for (let j = 0; j < numColumns; j++) {
            let td = document.createElement("td");
            td.appendChild(document.createTextNode(columns[j]));
            tr.appendChild(td);
        }
        thead.appendChild(tr);
        return thead;
    }

    /**
     * Validates that the field value is a number.
     * @param from The ID value from which to start searching.
     */
    function validate(from: number) {
        if (isNaN(from)) {
            alert("\"From\" field does not have a number value.");
            return false;
        } else if (from < 0) {
            alert("\"From\" value cannot be negative.");
            return false;
        }  else if (from > recordCount-1) {
            alert("\"From\" value exceeds the record count.");
            return false;
        }
        return true;
    }

}