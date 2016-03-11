let grid: iq.onboard.Grid,
	refreshHandle: number = 99;

$(() => {
	grid = new iq.onboard.Grid("#grid");

	initialize();
});

function initialize() {
	disableformSubmission();
	initNavigationHandlers();
	initControlPanel();
	initResizeHandler();
}

function disableformSubmission() {
	$("form").submit(() => {
		return false;
	});
}

function initNavigationHandlers() {
	$("#next-button").click(() => {
		grid.pageBy(1);
		updatePageDisplay(grid.getPageNumber());
	});

	$("#prev-button").click(() => {
		grid.pageBy(-1);
		updatePageDisplay(grid.getPageNumber());
	});

	$("#first-button").click(() => {
		grid.pageToFirst();
		updatePageDisplay(grid.getPageNumber());
	});

	$("#last-button").click(() => {
		grid.pageToLast();
		updatePageDisplay(grid.getPageNumber());
	});
}

function initControlPanel() {
	initControlPanelAnimation();
	initNavigationControlAnimation();
	initPageSelector();
}

function initControlPanelAnimation() {
	let $controlPanel = $(".control-panel");

	$controlPanel.mouseenter(() => {
		$controlPanel.stop(true, true);
		$controlPanel.fadeTo("slow", 1.0);
	});
	$controlPanel.mouseleave(() => {
		$controlPanel.stop(true, true);
		$controlPanel.fadeTo("slow", 0.0);
	});
}

function initNavigationControlAnimation() {
	let $control = $(".control");

	$control.mouseenter(() => {
		$control.addClass("control-selected");
	});
	$control.mouseleave(() => {
		$control.removeClass("control-selected");
	});
}

function initPageSelector() {

	let $pageSelector = $("#page-selector");

	$pageSelector.change(() => {
		grid.pageTo(parseInt($pageSelector.val()) - 1);
		updatePageDisplay(grid.getPageNumber());
	});
}

function updatePageDisplay(page: number) {
	let $pageSelector = $("#page-selector");
	$pageSelector.val(page + 1);		// Account for zero based indexing of pages
}

function initResizeHandler() {
	$(window).resize(() => {
		clearTimeout(refreshHandle);
		refreshHandle = setTimeout(() => { grid.redraw(); }, 250);
	});
}
