/** Wait for the document to be ready */
$(document).ready(() => {
	// Initialization and setup code
	const initialGridSize =  Math.ceil(Math.ceil((<number>($(window).innerHeight()))* GRID_RATIO)/ ROW_HEIGHT) - 1;
	const apidata = new ApiData(initialGridSize);

	// Set up search button click handler
	$('#searchBtn').on('click', () => {
		let from = parseInt(<string>($('#fromInput').val()));
		apidata.searchRecords(from);
	});

	// Initialize the grid
	apidata.initialize()
		.catch((error) => {
			console.error('Error during initialization:', error);
			alert(error);
		});
		
	// overlay when the page is still getting ready
	const overlay = $('<div id="overlay"></div>');
	$('body').append(overlay);
});
