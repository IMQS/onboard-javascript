window.onload = () => {
	var timeout;
	let table = new Table();
	
	let headings = new Row(table.getHead(), 0);
	$.getJSON("http://localhost:2050/columns", (data) => {
		headings.addRow(data, true);
	});

	let nav = new Navigation(table);
	$(window).on('resize', () => {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			nav.update();
		}, 250);
		
	});

	$.get("http://localhost:2050/recordCount", (data) => {
		nav.setMaxRecords(data - 1);
		nav.update();
	});
	
	nav.createSearchField();
	nav.createNavigationArrows();	
};
