/// <reference path="./third_party/jquery.d.ts" />
window.onload = function () {
    var count;
    count = document.body.innerHTML;
    count += "Count = ";
    $.get("http://localhost:2050/recordCount", function (data) {
        $("body").append(data);
        count += data;
    });
    document.body.innerHTML = count;
};
//# sourceMappingURL=app.js.map