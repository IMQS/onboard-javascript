var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();
var Data = (function () {
    function Data() {
    }
    return Data;
})();
window.onload = function () {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:2050/recordCount", false);
    xhr.send();
    console.log(xhr.response);
    //var xhr = new XMLHttpRequest();
    //xhr.open("GET", "http://localhost:2050/columns", false);
    //xhr.send();
    //console.log(xhr.response);
    //var xhr = new XMLHttpRequest();
    //xhr.open("GET", "http://localhost:2050/records?from=2&to=3", false);
    //xhr.send();
    //console.log(xhr.response);
};
//# sourceMappingURL=app.js.map