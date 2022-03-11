
window.onload = async () => {
	let state = new State();

	// Get data from server and load into table
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.loadIntoTable(true);
			}
		})
};

// Code is only triggered once per user input
const debounce = (fn: Function, ms: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

// Search entered ID
document.getElementById('id-search-btn')!.addEventListener("click", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.searchId();
			}
		})
}, 250));

// Set trim to start of data
document.getElementById('first')!.addEventListener("click", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.goToFirst();
			}
		})
}, 250));

// Set trim to previous data
document.getElementById('prev')!.addEventListener("click", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.goToPrev();
			}
		})
}, 250));

// Set trim to next data
document.getElementById('next')!.addEventListener("click", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.goToNext();
			}
		})
}, 250));

// Set trim to end of data
document.getElementById('last')!.addEventListener("click", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.goToLast();
			}
		})
}, 250));

// Add/remove rows from table based on resize event of the window
window.addEventListener("resize", debounce(async () => {
	let state = new State();
	await state.getData()
		.then(resp => {
			if (resp == true) {
				state.resize();
			}
		})
}, 150)); // Log window dimensions at most every 100ms
