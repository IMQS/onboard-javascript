import { ApiService } from './ApiService.js'
import { GridTemplate } from './GridTemplate.js'

let timeout: number = 0;
let numberOfRecords: number = 0;

function debounce <F extends (...args: any) => any>(func: F, waitFor: number) {
    const debounced = (...args: any) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), waitFor);
    }
    return debounced as (...args: Parameters<F>) => ReturnType<F>
}

window.onload = () => {
    numberOfRecords = Math.floor(((window.innerHeight-160) / 20))-1;
    var x = window.matchMedia("screen and (max-height: 700px)");
    console.log(x);
    $(".parentContainer").css({"display":"block",
                               "width": "100%",
                               "height": "100%"});

    $(".parentContainer").append('<div class="myGrid"></div>');
    $(".parentContainer").append('<div class="controls"></div>');

    let apiService = new ApiService(numberOfRecords);
    let gridTemplate = new GridTemplate(apiService.getColumnNames(), apiService.getDataRecords());
    
    $("#searchForm").on("submit", function(e) {
        let id = $("#search").val() as string;
        const regexp = new RegExp('^[1-9][0-9]*$|0');
        if(!regexp.test(id)){
            alert(`Invalid entry.`);
        } else if (parseFloat(id) >= apiService.getTotalRecords() || parseFloat(id) as number < 0) {
            alert(`ID ${id} does not fall between ${apiService.getTotalRecords()} and 0.`);
        } else {
            const fn = debounce( () => {
                apiService.getRecords(id);
                gridTemplate.setDataRecords(apiService.getDataRecords());
                gridTemplate.displayRecords();
            }, 350);
            fn();
        }
        e.preventDefault();
    });

    $("#next").on("click", () => {
        const fn = debounce( () => {
            apiService.next();
            gridTemplate.setDataRecords(apiService.getDataRecords());
            gridTemplate.displayRecords();
        }, 350);
        fn();
    });
   
    
    $("#prev").on("click", () => {
        const fn = debounce( () => {
            apiService.previous();
            gridTemplate.setDataRecords(apiService.getDataRecords());
            gridTemplate.displayRecords();
        }, 350);
        fn();
    });

    $( window ).on("resize", (e) => {
        //const fn = debounce( () => {
            var oldNumberOfRecords = numberOfRecords;
            numberOfRecords = Math.floor(((window.innerHeight-160) / 20))-1;
            apiService.setNumberOfRecords(numberOfRecords);
            if(oldNumberOfRecords<numberOfRecords){
                apiService.getCurrentRecords();
            }
            gridTemplate.setDataRecords(apiService.getDataRecords().slice(0, numberOfRecords));
            gridTemplate.displayRecords();
        //}, 70);
        //fn();
      });
}



