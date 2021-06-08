// create table elements and render in browser
var RenderTableHeading = /** @class */ (function () {
    function RenderTableHeading(container) {
        this.container = container;
    }
    RenderTableHeading.prototype.constructTableHeadings = function (element) {
        var tr = document.createElement('tr');
        tr.innerHTML = element.internalFormat();
        this.container.append(tr);
    };
    return RenderTableHeading;
}());
export { RenderTableHeading };
//# sourceMappingURL=render_headings.js.map