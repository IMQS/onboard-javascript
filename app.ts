window.onload = () => {

  let api: string = "http://localhost:2050/";

  // This function  will handle retrieving the records from the api
  async function getRecords(fromID: number, toID: number): Promise<Array<Array<string>>> {
    try {
      const data = await fetch(`${api}records?from=${fromID}&to=${toID}`);
      const records: Array<Array<string>> = await data.json();
      console.log(fromID, toID);
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
  showColumns();

  // This function will loop through and display the records on the table.
  async function showRecords(fromID: number, toID: number): Promise<void> {
    try {
      $("tbody").empty();
      let records = await getRecords(fromID, toID);
      for (let i = 0; i < records.length; i++) {
        $("tbody").append(`<tr class="body-row">`);
        for (let n = 0; n < records[i].length; n++) {
          $(".body-row:last-child").append(`<td>${records[i][n]}</td>`);
        }
        $("tbody").append(`</tr>`);
      }

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  showRecords(1, 20);

  // The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
  async function pageNumbers(start: number, end: number): Promise<void> {
    try {
      let count: number = await getRecordCount();
      let stringCount = count.toLocaleString().replace(/,/g, " ");
      $(".pagination").append(`<a class="prev">&laquo;</a>`);
      for (let i = start; i <= end; i++) {
        console.log(start, end);
        $(".pagination").append(
          `<a id="${i}" class="pagination-item">${i}</a>`
        );
      }
      $(".pagination").append(`<a class="next">&raquo;</a>`);

      // Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.
      $(".pagination-item").on("click", function (): void {
        let pageNumber: any = $(this).attr("id");
        let toID = parseInt(pageNumber) * 20;
        let fromID: number = toID - 19;
        $(".pagination-item").removeClass("active");
        $(this).addClass("active");
        showRecords(fromID, toID);
        $(".results").empty();
        $(".results").append(
          `Displaying ID's ${fromID} - ${toID} out of ${stringCount}`
        );
      });

      // Adding a click event to the next button of the pagination.
      $(".next").on("click", function () {
        $(".pagination").fadeOut("fast", function () {
          start = start + 20;
          end = end + 20;
          $(".pagination").empty();
          pageNumbers(start, end);
          $(".pagination").fadeIn("fast");
        });
      });

      // Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
      if (start == 1) {
        $(".prev").css({ display: "none" });
      } else {
        $(".prev").on("click", function () {
          $(".pagination").fadeOut("fast", function () {
            start = start - 20;
            end = end - 20;
            $(".pagination").empty();
            pageNumbers(start, end);
            $(".pagination").fadeIn("fast");
          });
        });
      }

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  pageNumbers(1, 20);

  // This function handles returning the records and also doing the filter on the returned records for the search.
  async function searchArrays(keyword: string): Promise<Array<Array<string>>> {
    try {
      
      let data = await fetch(`${api}records?from=1&to=9999`);
      const arrayOfArrays: Array<Array<string>> = await data.json();
      return arrayOfArrays.filter((arr): boolean => {
        if(keyword !== ""){
          console.log(typeof keyword)
          for (let i = 0; i < 11; i++) {
            const elementMatches = arr[i].toLowerCase().includes(keyword.toLowerCase());
            if (elementMatches) {
              console.log
              return true;
            }
          };
        } else {
          $(".results").empty();
          $(".results").append(`Can't leave search field empty`);    
        }
        return false;
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // The following is the search function that will be attached the on click.
  // In the function the filtered that is returned and looped through to replace the current data in the table and also highlighting where the keyword is similar to the results.
  async function searchResultsDisplay(event: any): Promise<void> {
    try {
      event.preventDefault();
      let keyword: string = $(".search-input").val() as 
      string;
      keyword = keyword.toLowerCase();
      let searchResult: Array<Array<string>> = await searchArrays(keyword);
      console.log(searchResult, keyword);
      if(keyword !== '') {
        $(".results").css({'background-color': 'initial', 'color': 'initial'})
        $("tbody").empty();
        $(".results").empty();
        $(".results").append(`${searchResult.length} RESULTS FOR "${keyword}"`).css({'color': '#A1AFC2'});
      } else {
        $("tbody").empty();
        $(".results").empty().append(`Search field requires a value`).css({'background-color': 'red', 'color': 'white'})
      }

      for (let i = 0; i < searchResult.length; i++) {
        let newRow = $('<tr class="body-row"></tr>');
        for (let n = 0; n < searchResult[i].length; n++) {
          let recordValue = searchResult[i][n];
          let lowercasedRecordValue = recordValue.toLowerCase();
          let $span = $(`<span class="highlight ${lowercasedRecordValue}">${recordValue}</span>`);
          newRow.append(`<td></td>`).find("td:last").append($span);
        }
        $("tbody").append(newRow);
      }

      // Loop through all <span> elements after appending them to the table
      $("span").each(function () {
        const lowercasedID: string = $(this).text().toLowerCase();
        if (lowercasedID.includes(keyword)) {
          $(this).css({ "background-color": "#FFFF00", "color": "black" });
        } else {
          $(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Attach click event to the search button using jQuery
  $(".search-btn").on("click", searchResultsDisplay);

};

 