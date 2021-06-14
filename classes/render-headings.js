// create table elements and render in browser
var RenderTableHeading = /** @class */ (function () {
    function RenderTableHeading(container) {
        this.container = container;
    }
    RenderTableHeading.prototype.constructTableHeadings = function (element) {
        var div = document.createElement('div');
        div.innerHTML = element.internalFormat();
        div.className = "tablecell";
        div.style.gridTemplateColumns = "repeat(" + element.arrayLength() + ", 1fr)";
        this.container.append(div);
    };
    return RenderTableHeading;
}());
export { RenderTableHeading };
//# sourceMappingURL=render-headings.js.map