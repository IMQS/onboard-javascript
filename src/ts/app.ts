import { ApiService } from './api-service.js'
import { GridTemplate } from './grid-template.js'

let timeout: number = 0;
let gridSize: number = 0;

//Debounce function to handle multiple request in a short frequency as only a single request
function debounce<F extends (...args: any) => any>(func: F, waitFor: number) {
    const debounced = (...args: any) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), waitFor);
    }
    return debounced as (...args: Parameters<F>) => ReturnType<F>
}

window.onload = () => {
    //Retrieve the grid size i.e. The number of records that can fit on the screen.
    //window.innerHeight is the total height of the display screen
    //15.6px is the height of a div according to the 12px font-size set. 
    //There should be a better way for this.
    //A 5/6 is the portion of the window's height that is provided to the grid.
    let windowHeight = Math.floor($(window).height() as number);
    gridSize = Math.floor(((windowHeight * 5 / 6) / 15.6)) - 1; // Minus one for the Header record

    $(".parentContainer").append('<div class="myGrid"></div>');
    $(".parentContainer").append('<div class="controls"></div>');

    let apiService = new ApiService(gridSize); // Parse in initial grid size
    let gridTemplate: GridTemplate;
    //Nested promises. First get the recordCount then the starting records.
    apiService.recordCount().then(() => {
        apiService.getCurrentRecords().then(() => {
            gridTemplate = new GridTemplate(apiService.getColumnNames(), apiService.getDataRecords());


            $("#searchForm").on("submit", function (e) {
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

            //Handle event when Next button is clicked. Debouncing is used for this function.
            $("#next").on("click", () => {
                const fn = debounce(() => {
                    apiService.next()?.then(() => {
                        gridTemplate.setDataRecords(apiService.getDataRecords());
                        gridTemplate.displayRecords();
                    })
                }, 350);
                fn();
            });

            //Handle event when Previous button is clicked. Debouncing is used for this function.
            $("#prev").on("click", () => {
                const fn = debounce(() => {
                    apiService.previous()?.then(() => {
                        gridTemplate.setDataRecords(apiService.getDataRecords());
                        gridTemplate.displayRecords();
                    })
                }, 350);
                fn();
            });

            //Handle event when resizing the browser window. Recalculate the grid size and display accordingly
            $(window).on("resize", () => {
                let oldNumberOfRecords = gridSize;
                let windowHeight = Math.floor($(window).height() as number);
                gridSize = Math.floor(((windowHeight * 5 / 6) / 15.6)) - 1;
                //To make sure we are working with a positive sized grid
                if (gridSize >= 0 && oldNumberOfRecords >= 0) {
                    apiService.setGridSize(gridSize);
                    if (oldNumberOfRecords < gridSize) {
                        //Only request new records if the grid size was enlarged.
                        apiService.getCurrentRecords().then(() => {
                            gridTemplate.setDataRecords(apiService.getDataRecords().slice(0, gridSize));
                            gridTemplate.displayRecords();
                        });
                    } else {
                        //Slice the data records to display less records to fit the grid.
                        gridTemplate.setDataRecords(apiService.getDataRecords().slice(0, gridSize));
                        gridTemplate.displayRecords();
                    }
                }
            });
        })
    });
}



