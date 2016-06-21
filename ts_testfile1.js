var Test = (function () {
    function Test() {
        this.example = 'Test';
    }
    Test.prototype.withFatArrow = function () {
        var _this = this;
        this.timer = setTimeout(function () { return alert(_this.example); }, 500);
    };
    Test.prototype.withoutFatArrow = function () {
        this.timer = setTimeout(function () { alert(this.example); }, 500);
    };
    return Test;
}());
var test = new Test();
//test.withFatArrow();
test.withoutFatArrow();
//# sourceMappingURL=ts_testfile1.js.map