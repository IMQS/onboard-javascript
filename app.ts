
/** Wait for the document to be ready*/
$(document).ready(() => {
	// Initialization and setup code
	const initialGridSize = Math.floor((<number>($(window).innerHeight()) * GRID_RATIO) / ROW_HEIGHT) ;
	const apidata = new ApiData(initialGridSize);
	// Set up search button click handler
	$('#searchBtn').on('click', () => {
		let from = parseInt(<string>($('#fromInput').val()));
		const pageSize = apidata.pageSize;
		const maxRange = apidata.totalItems - 1;

		if (!isNaN(from) && from >= 0 && from <= maxRange) {
			if (from + pageSize > maxRange) {
				from = Math.max(0, maxRange - pageSize);	
			}
			apidata.searchRecords(from);
		} else if (from < 0 || from > maxRange) {
			alert(`please enter values in the range (0-${maxRange})`);
			return;
		} else if (isNaN(from)) {
			alert('Please enter a numerical value ');
		} else {
			console.error('error');
		}
		//empty search input after searching 
		$('#fromInput').val('');
	});
	// Initialize the grid
	apidata.initialize()
		.catch((error) => {
			console.error('Error during initialization:', error);
			alert(error);
		});
	//overlay when the page is still getting ready
	const overlay = $('<div id="overlay"></div>');
	$('body').append(overlay);
});
