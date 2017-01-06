window.onload = function () {
    var timeout;
    var table = new Table();
    var headings = new Row(table.getHead(), 0);
    $.getJSON("http://localhost:2050/columns", function (data) {
        headings.addRow(data, true);
    });
    var nav = new Navigation(table);
    $(window).on('resize', function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            nav.update();
        }, 250);
    });
    $.get("http://localhost:2050/recordCount", function (data) {
        nav.setMaxRecords(data - 1);
        nav.update();
    });
    nav.createSearchField();
    nav.createNavigationArrows();
};
//# sourceMappingURL=Main.js.map