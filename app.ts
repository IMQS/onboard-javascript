import { ApiService } from './api-service.js'
import { GridTemplate } from './grid-template.js'

let timeout: number = 0;
let gridSize: number = 0;
let gridFraction = 5 / 6;   // A 5/6 is the portion of the window's height that is provided to the grid.
let rowHeight = 15.6;       // 15.6px is the height of a div(row) according to the 12px font-size set. 

// Debounce function to handle multiple request in a short frequency as only a single request
function debounce<F extends (...args: any) => any>(func: F, waitFor: number) {
    const debounced = (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    }
    return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

window.onload = () => {
    // Retrieve the grid size i.e. The number of records that can fit on the screen.
    // window.innerHeight is the total height of the display screen
    // There should be a better way for this.

    let windowHeight = Math.floor($(window).height() as number);
    gridSize = Math.floor(((windowHeight * gridFraction) / rowHeight)) - 1; // Minus one for the header record

    let apiService = new ApiService(gridSize); // Parse in initial grid size
    // Nested promises. First get the recordCount then the starting records.
    apiService.recordCount().then(() => {
        apiService.getCurrentRecords().then(() => {
            let gridTemplate = new GridTemplate(apiService.getColumnNames(), apiService.getDataRecords());

            $("#searchForm").on("submit", (e) => {
                let id = $("#search").val() as string;
                const regexp = new RegExp("^[1-9][0-9]*$|0");
                if (!regexp.test(id)) {
                    alert("Invalid entry.");
                } else if (parseFloat(id) >= apiService.getTotalRecords() || parseFloat(id) as number < 0) {
                    alert(`ID ${id} does not fall between ${apiService.getTotalRecords()} and 0.`);
                } else {
                    const fn = debounce(() => {
                        apiService.searchRecord(id).then(() => {
                            gridTemplate.setDataRecords(apiService.getDataRecords());
                            gridTemplate.displayRecords();
                        });
                    }, 350);
                    fn();
                }
                e.preventDefault();
            });

            // Handle event when Next button is clicked. Debouncing is used for this function.
            $("#next").on("click", () => {
                const fn = debounce(() => {
                    apiService.next()?.then((dataRecords) => {
                        gridTemplate.setDataRecords(dataRecords);
                        gridTemplate.displayRecords();
                    }).catch((e) => {
                        console.log(e);
                    });
                }, 350);
                fn();
            });

            // Handle event when Previous button is clicked. Debouncing is used for this function.
            $("#prev").on("click", () => {
                const fn = debounce(() => {
                    apiService.previous()?.then((dataRecords) => {
                        gridTemplate.setDataRecords(dataRecords);
                        gridTemplate.displayRecords();
                    }).catch((e) => {
                        console.log(e);
                    });
                }, 350);
                fn();
            });

            // Handle event when resizing the browser window. Recalculate the grid size and display accordingly
            $(window).on("resize", () => {
                let oldNumberOfRecords = gridSize;
                let windowHeight = Math.floor($(window).height() as number);
                gridSize = Math.floor(((windowHeight * gridFraction) / rowHeight)) - 1;
                // To make sure we are working with a positive sized grid
                if (gridSize >= 0 && oldNumberOfRecords >= 0) {
                    apiService.setGridSize(gridSize);
                    if (oldNumberOfRecords < gridSize) {
                        // Only request new records if the grid size was enlarged.
                        apiService.getCurrentRecords().then((dataRecords) => {
                            gridTemplate.setDataRecords(dataRecords);
                            gridTemplate.displayRecords();
                        }).catch((e) => {
                            console.log(e);
                        });
                    } else {
                        // Slice the data records to display less records to fit the grid.
                        gridTemplate.setDataRecords(apiService.getDataRecords().slice(0, gridSize));
                        gridTemplate.displayRecords();
                    }
                }
            });
        });
    });
}
