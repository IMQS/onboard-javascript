class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}
class Data {

}

window.onload = () => {
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