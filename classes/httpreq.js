export function request(action, method, callback) {
    var x = {};
    if (window.XMLHttpRequest)
        x = new XMLHttpRequest();
    else
        x = ActiveXObject('Microsoft.XMLHTTP');
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    x.open(method, action, true);
    x.send();
}
//# sourceMappingURL=httpreq.js.map