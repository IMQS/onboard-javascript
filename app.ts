window.onload = async () => {
	let state = new State();

	// Get data from server and load into table
	await state.getData().then(resp => {
		if (resp == true) {
			state.loadIntoTable(true);
		}
	})

	// Set needed navigation controls
	state.setSearchButton();
	state.setPageButtons();
	state.setResizeEvent();
};
