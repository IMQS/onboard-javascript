  let api: string = "http://localhost:2050/";
  let isFunctionRunning = false;
  let currentPage = 1;
  let lastPage = currentPage + 9
  let firstPage = 1
  let currentFromID = 1;
  let currentToID = 20;
  


  // This function  will handle retrieving the records from the api
  async function getRecords(fromID: number, toID: number): Promise<Array<Array<string>>> {
    try {
      console.log(fromID, toID)
      const data = await fetch(`${api}records?from=${fromID}&to=${toID}`);
      const records: Array<Array<string>> = await data.json();
      return records;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // This function  will handle retrieving the columns from the api
  async function getColumns(): Promise<Array<string>> {
    try {
      const data = await fetch(`${api}columns`);
      const columns: Array<string> = await data.json();
      return columns;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // This function  will handle retrieving the record count from the api
  async function getRecordCount(): Promise<number> {
    try {
      const data = await fetch(`${api}recordCount`);
      const count: number = await data.json();
      return count;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
 
  // This function will loop through and display the appropriate columns in the correct order.
  async function showColumns(): Promise<void> {
    try {
      $(".head-row").empty();
      let columns = await getColumns();
      for (let i = 0; i < columns.length; i++) {
        $("thead").append(`<th>${columns[i]}</th>`);
      }

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // This function will loop through and display the records on the table.
  async function showRecords(fromID: number, toID: number): Promise<void> {
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    let inputNumber: string = $('.search-input').val() as string
    if(inputNumber == "") {
      currentFromID = fromID
    } 
    try {
      console.log(fromID, toID)
      $("tbody").empty();
      loader()
      let records = await getRecords(fromID, toID);
      let count: number = await getRecordCount();
      let stringCount = count.toLocaleString().replace(/,/g, " ");
      $('.results').empty().append(`Displaying ID's ${fromID} - ${toID} out of ${stringCount}`)
      for (let i = 0; i < records.length; i++) {
        $("tbody").append(`<tr class="body-row">`);
        for (let n = 0; n < records[i].length; n++) {
          $(".body-row:last-child").append(`<td><span>${records[i][n]}</span></td>`);
        }
        $("tbody").append(`</tr>`);
      }
      
      let inputNumber: string = $('.search-input').val() as string
      $("span").each(function () {
        const lowercasedID: string = $(this).text() as string; 
        if (lowercasedID == inputNumber) {
          $(this).css({ "background-color": "#FFFF00", "color": "black  " });
        } else {
          $(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
        }
      });
      
    } catch (error) {
      console.error(error);
      throw error;
    }
    isFunctionRunning = false;
  }

  // The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
  async function pageNumbers(start: number, end: number): Promise<void> {
    try {
      $('.pagination').empty();
      let count: number = await getRecordCount();
      let stringCount = count.toLocaleString().replace(/,/g, " ");
      console.log(start, end )
      $(".pagination").append(`<a class="prev">&laquo;</a>`);
      
      for (let i = start; i <= end; i++) {
        $(".pagination").append(
          `<a id="${i}" class="pagination-item">${i}</a>`
        );
      }
      $(".pagination").append(`<a class="next">&raquo;</a>`);
      
      // Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.
      $(".pagination-item").on("click", async function dynamicPagination(): Promise<Array<number>>{
        currentPage = parseInt($(this).attr("id") as any);
        const screenHeight = $(window).height();
        const maxRecords = Math.floor(parseInt(screenHeight as any) / 60) - 1;
        let pageNumber: any = $(this).attr("id");
        let toID = (parseInt(pageNumber) * maxRecords + 1);
        let fromID: number = toID - (maxRecords);
        if(fromID > count || toID > count) {
          toID = count - 1 ;
          fromID = toID - maxRecords
          console.log(fromID, toID)
          currentFromID = fromID
        }
        $(".pagination-item").removeClass("active");
        $(this).addClass("active");
        showRecords(fromID, toID);
        $(".results").empty();
        $(".results").append(
          `Displaying ID's ${fromID} - ${toID} out of ${stringCount}`
        );
        return [fromID, toID]
      });

      // Adding a click event to the next button of the pagination.
      console.log(start, end )
      $(".next").on("click", async function () {
        if (isFunctionRunning) {
          return;
        }
        isFunctionRunning = true
        console.log(end)
          end = end + 10;
          start = end - 9;
          $(".pagination").empty();
          await pageNumbers(start, end);
          isFunctionRunning = false
      });

      // Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
      $(".prev").on("click", function () {
        if(isFunctionRunning) {
          return;
        }
        isFunctionRunning = true
          $(".pagination").fadeOut("fast", function () {
            console.log(start, end)
            start = start - 10;
            end = start + 9;
            $(".pagination").empty();
            pageNumbers(start, end);
            $(".pagination").fadeIn("fast");
          });
          isFunctionRunning = false
        });

      if (start == 1 ) {
        $(".prev").css({ display: "none" });
      } 
      console.log(currentToID)
      if(currentToID == 999999){
        $(".next").css({ display: "none" });
      }

      $(".pagination-item").each(function () {
        let elementID = $(this).attr('id') as string;
        let currentPageString: string = currentPage.toString();
        console.log(elementID, currentPageString )   
        if (elementID == currentPageString) {
          $(this).addClass('active')
        } 
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // In this function wil do the extract the number entered in the search. Then it would take that and calculate the range which should be displayed for the user to click on. 
  async function resultsRange(event: any) {
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    event.preventDefault();
    let inputNumber: string = $('.search-input').val() as string
    let inputNumberInt = parseInt(inputNumber);
    if(inputNumber !== '') {
      const screenHeight = $(window).height();
      const maxRecords = Math.floor(parseInt(screenHeight as any) / 60) - 1;
      let end:number = Math.ceil(inputNumberInt / maxRecords) * maxRecords;
      if(end > 1000000) {
        end = 999999
        currentToID = end
      }
      let start: number = (end - maxRecords + 1);
      currentPage = Math.floor(end / maxRecords)
      if(inputNumberInt < 1000000) {
        if(end === 1000000){
          end = end - 1;
        } else null
        $('.results-box').remove()
        $('.search-container').append(`
                                      <div class="results-box">
                                        <p class="results-select">${start} - ${end}</p>
                                      </div>
                                      `)
        $('.results-box').on('click', resultsSelect)
        } else {
          $('.results-box').remove()
        }
      } else {
        $('.results-box').remove()
      }
      
      isFunctionRunning = false;
    }
    $(".search-input").on("keyup", resultsRange);

  // After the range has been returned to the user. The user can click on it and that will show the range of records on the table. 
  async function resultsSelect() {
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    let idRange = $('.results-select').text();
    let rangeArray = null
    rangeArray = idRange.split('-');
    $('.results-box').remove()
    let startID = parseInt(rangeArray[0])
    let endID = parseInt(rangeArray[1])
    isFunctionRunning = false;
    await showRecords(startID, endID)
    console.log(startID, endID)
    const screenHeight = $(window).height();
    const maxRecords = Math.floor(parseInt(screenHeight as any) / 60) - 1;
    currentPage = Math.ceil(endID / maxRecords)
    let pageEnd = Math.ceil(Math.floor(endID / maxRecords) / 10) * 10;
    let pageStart = pageEnd - 9
    
    console.log('currentPage: ' + currentPage + ', end: ' + endID + ', pageEnd: ' + pageEnd)
    if(endID == 999999) {
      console.log(maxRecords)
      startID = ((currentPage - 1) * maxRecords) + 1;
      endID = 9999999
      console.log(currentPage)
      pageEnd = currentPage
    }
    
    await pageNumbers(pageStart, pageEnd)
    console.log(pageStart, pageEnd)
  }

  // When adjusting the height and on different screen sizes. This function would responsible for calculating how much records should be displayed based on the height of the window itself. 
  async function adjustDisplayedRecords(): Promise<number> {
    const screenHeight = $(window).height();
    const maxRecords = Math.floor(parseInt(screenHeight as any) / 60) - 1;
    
    let inputNumber = $('.search-input').val() as string
    let length = inputNumber.length as number;
    let inputNumberInt = parseInt(inputNumber)

    if(inputNumber == '') {
      console.log('empty')
      console.log(currentFromID, currentToID)
      currentToID = currentFromID + maxRecords;
      let newCurrentPage = Math.ceil(currentFromID / maxRecords)
      console.log(newCurrentPage)
      currentPage = newCurrentPage

    } else {
      console.log('content')
      if(length > 0) {
        let newCurrentPage = Math.ceil(inputNumberInt / maxRecords)
        currentToID = newCurrentPage * maxRecords;
        console.log('newCurrentPage: ' + newCurrentPage, ' ')
        console.log(newCurrentPage)
        currentPage = newCurrentPage
        currentFromID = (currentPage - 1) * maxRecords + 1;
        
      }
      if(currentToID > 999999) {
        currentToID = 999999
      }
      
    
    }
    console.log(currentFromID, currentToID)
      $("tbody").empty();
      await showRecords(currentFromID, currentToID);
      let pageEnd = Math.ceil(Math.floor(currentToID / maxRecords) / 10) * 10;
      let pageStart = pageEnd - 9
      await pageNumbers(pageStart, pageEnd);
      console.log(currentFromID, currentToID)
      
    return maxRecords;
  }

  let resizeTimer: ReturnType<typeof setTimeout>;

 function resize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(async () => {
    const maxRecords: number = await adjustDisplayedRecords();
  }, 750);
}

  // Just a loader to display when the table is empty and records is being fetched. 
  function loader() {
    let content = $('tbody').text();
    if(content == '') {
      $('.results').append('<div class="loader"></div>')
    } else {
      $('.loader').css({'display': 'none'})
    }
  }

  
  
window.onload = () => {
  showColumns();
  // pageNumbers(1, 10);
  adjustDisplayedRecords();
  $(window).on('resize', resize);
};

 