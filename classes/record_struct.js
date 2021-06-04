var recordStruct = /** @class */ (function () {
    function recordStruct(id, a, b, c, d, e, f, g, h, i, j) {
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
    recordStruct.prototype.format = function () {
        return "<td>" + this.id + "</td> <td>" + this.A + "</td> <td>" + this.B + "</td> <td>" + this.C + "</td> <td>" + this.D + "</td> <td>" + this.E + "</td> <td>" + this.F + "</td> <td>" + this.G + "</td> <td>" + this.H + "</td> <td>" + this.I + "</td> <td>" + this.J + "</td>";
    };
    return recordStruct;
}());
export { recordStruct };
//# sourceMappingURL=record_struct.js.map