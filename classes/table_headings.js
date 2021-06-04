var tableHeadings = /** @class */ (function () {
    function tableHeadings(id, a, b, c, d, e, f, g, h, i, j) {
        this.id = id;
        this.A = a;
        this.B = b;
        this.C = c;
        this.D = d;
        this.E = e;
        this.F = f;
        this.G = g;
        this.H = h;
        this.I = i;
        this.J = j;
    }
    tableHeadings.prototype.format = function () {
        return "<th>" + this.id + "</th> <th>" + this.A + "</th> <th>" + this.B + "</th> <th>" + this.C + "</th> <th>" + this.D + "</th> <th>" + this.E + "</th> <th>" + this.F + "</th> <th>" + this.G + "</th> <th>" + this.H + "</th> <th>" + this.I + "</th> <th>" + this.J + "</th>";
    };
    return tableHeadings;
}());
export { tableHeadings };
//# sourceMappingURL=table_headings.js.map