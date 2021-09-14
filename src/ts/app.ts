import { ApiService } from './ApiService.js'
import { GridTemplate } from './GridTemplate.js'

window.onload = () => {
    $(".parentContainer").css({"display": "grid",
                               "width": "100%",
                               "height": "100%"});

    $(".parentContainer").append('<div class="myGrid"></div>');
    $(".parentContainer").append('<div class="buttons"></div>');

    $(".buttons").css({"width": "100%",
                       "height": "100%"});

    let apiService = new ApiService();
    let gridTemplate = new GridTemplate(apiService.getColumnNames(), apiService.getDataRecords());
    $("#next").on("click", function() {
        apiService.next();
        gridTemplate.setDataRecords(apiService.getDataRecords());
        gridTemplate.displayRecords();
    });
    
    $("#prev").on("click", function() {
        apiService.previous();
        gridTemplate.setDataRecords(apiService.getDataRecords());
        gridTemplate.displayRecords();
    });
}

