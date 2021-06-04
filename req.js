function request(action, method, params, callback) {
    let x = {};
    if (window.XMLHttpRequest) x = new XMLHttpRequest();
    else x = new ActiveXObject('Microsoft.XMLHTTP');
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };

    let paramString = ""; 
    let dataPairs = []; 
    let name;
    for(name in params)
        dataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
    paramString = dataPairs.join('&').replace(/%20/g, '+');

    action += "?" + paramString;
    x.open(method, action, true);
    x.send(); return;
}