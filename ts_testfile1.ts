class Test {
    public example = 'Test';
    private timer;

    withFatArrow() {
        this.timer = setTimeout(() => alert(this.example), 500);
    }

    withoutFatArrow() {
        this.timer = setTimeout(function () { alert(this.example) }, 500);
    }
}

var test = new Test();
//test.withFatArrow();
test.withoutFatArrow();