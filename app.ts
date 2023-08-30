// *** Development Setup ***//
// go run main.go
// npm run build
// npm run watch

window.onload = () => {
   $("footer").text("Hello Who is watching ??"); 
   fetchTotalRecords();
   fetchColumns();

  };

async function fetchTotalRecords() {
  // Fetch data from API
  const response = await fetch("http://localhost:2050/recordCount");

  // Check for successful response
  if (response.ok) {
    // Parse the text content from the response body
    const data = await response.text();

    // Log the data to the console
    console.log(`Total records: ${data}`);
  } else {
    // Log an error message if the request was not successful
    console.log(`Fetch failed: ${response.status} ${response.statusText}`);
  }
};

async function fetchColumns() {
  // Fetch data from API
  const response = await fetch("http://localhost:2050/columns");

  // Check for successful response
  if (response.ok) {
    // Parse the text content from the response body
    const data = await response.json();

    // Log the data to the console
    console.log(`Columns: ${data}`);
  } else {
    // Log an error message if the request was not successful
    console.log(`Fetch failed: ${response.status} ${response.statusText}`);
  }
}
