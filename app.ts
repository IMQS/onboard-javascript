// Interface to define the structure of grid data
interface ColumnName {
	name: string;
}
// Interface to define column names
interface GridData {
	[key: string]: any;
}
// Debounce utility function to limit function execution frequency
function debounce<F extends (...args: any) => any>(func: F, waitFor: number) {
	let timeout: number;

	return (...args: Parameters<F>): Promise<ReturnType<F>> => {
		clearTimeout(timeout);

		return new Promise((resolve) => {
			timeout = setTimeout(() => {
				resolve(func(...args));
			}, waitFor);
		});
	};
};
// Constants for grid calculation
const gridRatio = 9 / 20;// represents the ratio of the grid's height to the window's height. 
const rowHeight = 16;
// Wait for the document to be ready
$(document).ready(() => {
	// Initialization and setup code
	const windowHeight = Math.floor($(window).innerHeight() as number);
	const initialGridSize = Math.floor((windowHeight * gridRatio) / rowHeight) - 1;
	const apidata = new ApiData(initialGridSize);
	// Set up search button click handler
	$('#searchBtn').on('click', () => {
		const from = parseInt($('#fromInput').val() as string);
		const pageSize = apidata.pageSize;
		const maxRange = apidata.totalItems - 1;
		if (!isNaN(from) && from >= 0 && from <= maxRange) {
			let to = Math.min(from + pageSize, maxRange);
			let adjustedFrom = from;
			if (adjustedFrom + pageSize > maxRange) {
				adjustedFrom = Math.max(0, maxRange - pageSize);
				to = maxRange;
			};
			apidata.searchRecords(adjustedFrom);
		} else if (from < 0 || from > maxRange) {
			alert('please enter values in the range (0-999999)');
			return;
		} else if (isNaN(from)) {
			alert('Please enter a numerical value ')
		} else {
			console.error('error')
		};
		//empty search input after searching 
		$('#fromInput').val('');
	});
	// Initialize the grid
	apidata.initialize();
	//overlay when the page is still getting ready
	const overlay = $('<div id="overlay"></div>');
	$('body').append(overlay);
});
